import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Laptop, TrendingUp } from 'lucide-react';
import { useStore } from '../store';

export default function EventList() {
  const navigate = useNavigate();
  const { events, setEvents, selectedInterests } = useStore();

  const calculateProductivityScore = (demographics: any) => {
    // Weight tech percentage more heavily in the score
    return Math.round((demographics.professionalDistribution.tech * 0.8 + 
           demographics.professionalDistribution.business * 0.2) * 0.9);
  };

  useEffect(() => {
    // Set mock events when component mounts
    const mockEvents = [
      {
        id: '1',
        title: 'Montreal Tech Summit 2024',
        description: 'Premier tech conference featuring cutting-edge developments in AI, cloud computing, and software architecture',
        date: '2024-04-15',
        location: 'Montreal, QC',
        imageUrl: 'https://images.unsplash.com/photo-1591267990532-e5bdb1b0ceb8?auto=format&fit=crop&q=80&w=1000',
        interests: ['1'],
        demographics: {
          techRatio: 95,
          totalAttendees: 500,
          professionalDistribution: {
            tech: 97,
            business: 2,
            other: 1
          }
        }
      },
      {
        id: '2',
        title: 'DevOps Montreal Conference',
        description: 'Deep dive into modern DevOps practices, cloud infrastructure, and system reliability engineering',
        date: '2024-05-01',
        location: 'Montreal, QC',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000',
        interests: ['1'],
        demographics: {
          techRatio: 90,
          totalAttendees: 300,
          professionalDistribution: {
            tech: 80,
            business: 15,
            other: 5
          }
        }
      },
      {
        id: '3',
        title: 'Full Stack Montreal',
        description: 'Comprehensive conference covering frontend, backend, and everything in between for modern web development',
        date: '2024-05-15',
        location: 'Montreal, QC',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000',
        interests: ['1'],
        demographics: {
          techRatio: 88,
          totalAttendees: 400,
          professionalDistribution: {
            tech: 75,
            business: 20,
            other: 5
          }
        }
      },
      {
        id: '4',
        title: 'Business Innovation Forum',
        description: 'Connect with business leaders, entrepreneurs, and tech innovators shaping the future of industry',
        date: '2024-05-20',
        location: 'Montreal, QC',
        imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1000',
        interests: ['1'],
        demographics: {
          techRatio: 25,
          totalAttendees: 600,
          professionalDistribution: {
            tech: 20,
            business: 75,
            other: 5
          }
        }
      }
    ].map(event => ({
      ...event,
      productivityScore: calculateProductivityScore(event.demographics)
    }));

    setEvents(mockEvents);
  }, [setEvents]);

  const filteredEvents = selectedInterests.length > 0
    ? events.filter(event =>
        event.interests.some(i => selectedInterests.includes(i))
      )
    : events;

  const handleEventSelect = (eventId: string) => {
    navigate(`/connections/${eventId}`);
  };

  if (filteredEvents.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">No Events Found</h1>
          <p className="text-gray-600">We couldn't find any events matching your interests. Check back later for updates!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Recommended Events</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                
                <div className="flex items-center gap-4 text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-600">Tech Professionals</span>
                    </div>
                    <span className="font-semibold text-purple-600">{event.demographics.techRatio}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-600">Expected Attendees</span>
                    </div>
                    <span className="font-semibold text-purple-600">{event.demographics.totalAttendees}</span>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Demographic Distribution</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                      <div 
                        className="bg-purple-400" 
                        style={{width: `${event.demographics.professionalDistribution.tech}%`}}
                        title="Tech"
                      />
                      <div 
                        className="bg-blue-400" 
                        style={{width: `${event.demographics.professionalDistribution.business}%`}}
                        title="Business"
                      />
                      <div 
                        className="bg-gray-400" 
                        style={{width: `${event.demographics.professionalDistribution.other}%`}}
                        title="Other"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{event.demographics.professionalDistribution.tech}% Tech</span>
                      <span>{event.demographics.professionalDistribution.business}% Business</span>
                      <span>{event.demographics.professionalDistribution.other}% Other</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">Productivity Score</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`font-semibold ${
                          event.productivityScore >= 80 ? 'text-green-600' :
                          event.productivityScore >= 60 ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {event.productivityScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleEventSelect(event.id)}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  See Potential Connections
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}