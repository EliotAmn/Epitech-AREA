import {BadRequestException, UnauthorizedException} from '@nestjs/common';
import {UserService} from '@prisma/client';
import axios, {AxiosError} from 'axios';

import {ServiceDefinition} from '@/common/service.types';
import {buildServiceRedirectUrl, buildUrlParameters} from '@/common/tools';
import {SendEmailReaction} from './reactions/send-email.reaction';

interface GoogleTokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

interface GoogleErrorResponse {
    error: string;
    error_description?: string;
}

async function oauth_callback(
    userService: UserService,
    params: { [key: string]: string },
): Promise<boolean> {
    const authorizationCode = params.code as string | undefined;
    if (!authorizationCode)
        throw new BadRequestException('Authorization code is missing');

    const redirectUri = buildServiceRedirectUrl('gmail');

    const formData = new URLSearchParams();
    formData.append('code', authorizationCode);
    formData.append('redirect_uri', redirectUri);
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', process.env.GOOGLE_CLIENT_ID!);
    formData.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);

    try {
        const res = await axios.post<GoogleTokenResponse>(
            'https://oauth2.googleapis.com/token',
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );

        if (res.status !== 200)
            throw new UnauthorizedException(
                'Failed to exchange authorization code for tokens',
            );

        const tokens = res.data;
        const accessToken = tokens.access_token;
        const refreshToken = tokens.refresh_token;

        console.log('✅ Gmail OAuth successful!');

        userService.service_config = {
            ...((userService.service_config as object) || {}),
            google_access_token: accessToken,
            google_refresh_token: refreshToken,
        };
    } catch (error: unknown) {
        const axiosError = error as AxiosError<GoogleErrorResponse>;
        console.error('=== GMAIL OAUTH ERROR ===');
        console.error('Error response:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
        console.error('Error message:', axiosError.message);
        console.error('========================');

        const errorDetail =
            axiosError.response?.data?.error_description || axiosError.message;
        throw new UnauthorizedException(`Gmail OAuth failed: ${errorDetail}`);
    }

    return true;
}

export default class GmailService implements ServiceDefinition {
    name = 'gmail';
    label = 'Gmail';
    mandatory_env_vars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
    oauth_url = buildUrlParameters(
        'https://accounts.google.com/o/oauth2/v2/auth',
        {
            client_id: process.env.GOOGLE_CLIENT_ID!,
            response_type: 'code',
            redirect_uri: buildServiceRedirectUrl('gmail'),
            scope: 'https://www.googleapis.com/auth/gmail.send',
            access_type: 'offline',
            prompt: 'consent',
        },
    );
    oauth_callback = oauth_callback;
    description =
        'Send emails on behalf of a user authenticated via Google OAuth';

    actions = [];
    reactions = [SendEmailReaction];
}
