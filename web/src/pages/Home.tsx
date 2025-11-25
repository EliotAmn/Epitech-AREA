import { useNavigate } from 'react-router-dom'
import Widget from '../component/widget'
import Button from '../component/button'

function Home() {
  const navigate = useNavigate()

  return (
      <div className="min-h-screen flex items-start justify-center bg-white">
          <div className="flex flex-col items-center w-full h-[530px] bg-[#242424]">
              <h1 className="text-center text-[#ffffff] text-[75px] font-bold mb-6">Automate. Save time.<br />
              Get more done.</h1>
              <Button
                  label="Create your free account"
                  onClick={() => navigate('/signup')}
              />
              <div className="flex flex-row gap-4 flex-wrap justify-center m-4 flex-gap-fallback">
                <Widget
                    titre="Quickly create events in a Google Calendar"
                    color="#3b82f6"
                    onClick={() => navigate('/widget/calendar', {
                      state: { titre: "Quickly create events in a Google Calendar", color: "#3b82f6" }
                    })}
                />
                <Widget
                    titre="Widget"
                    color="#ef4444"
                    onClick={() => navigate('/widget/autre', {
                      state: { titre: "Widget", color: "#ef4444" }
                    })}
                />
              </div>
          </div>
      </div>
  )
}

export default Home
