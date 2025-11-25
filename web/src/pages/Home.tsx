import { useNavigate } from 'react-router-dom'
import Widget from '../component/widget'
import Button from '../component/button'

function Home() {
  const navigate = useNavigate()

  return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-white">
          <div className="flex flex-col items-center w-full h-[530px] bg-[#242424] gap-6">
              <p className="text-center text-[#ffffff] text-[75px] font-bold">Automate. Save time.<br />
                Get more done.</p>
              <Button
                  label="Create your free account"
                  variant="white"
                  size="300px"
                  onClick={() => navigate('/signup')}
              />
          </div>
          <h2 className="text-center text-[45px] font-bold mt-8">Get started with any Applet</h2>
          <div className="flex flex-row gap-4 flex-wrap justify-center m-4 flex-gap-fallback">
            <Widget
              titre="Quickly create events in a Google Calendar"
              plateforme='Google Calendar'
              color="#3b82f6"
              onClick={() => navigate('/widget/calendar', {
                state: { titre: "Quickly create events in a Google Calendar", color: "#3b82f6" }
              })}
            />
            <Widget
              titre="Widget"
              plateforme='Autre'
              color="#D639DB"
              onClick={() => navigate('/widget/autre', {
                state: { titre: "Widget", color: "#ef4444" }
              })}
            />
            <Widget
              titre="Widget"
              plateforme='Autre'
              color="#39DB8A"
              onClick={() => navigate('/widget/autre', {
                state: { titre: "Widget", color: "#ef4444" }
              })}
            />
            <Widget
              titre="Widget"
              plateforme='Autre'
              color="#ef4444"
              onClick={() => navigate('/widget/autre', {
                state: { titre: "Widget", color: "#ef4444" }
              })}
            />
          </div>
      </div>
  )
}

export default Home
