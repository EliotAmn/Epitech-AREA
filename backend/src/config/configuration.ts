export default () => ({
    port: parseInt(process.env.PORT || "3000") || 3000,
    jwtSecret: process.env.JWT_SECRET,
});
