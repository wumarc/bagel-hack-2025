import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Heart, Calendar, Tag, Brain, Briefcase } from 'lucide-react';
import { useStore } from '../store';

interface DiscGraphProps {
  primary: 'D' | 'I' | 'S' | 'C';
  secondary: 'D' | 'I' | 'S' | 'C';
}

const DiscGraph: React.FC<DiscGraphProps> = ({ primary, secondary }) => {
  const getDiscPosition = (type: 'D' | 'I' | 'S' | 'C') => {
    const positions = {
      D: { x: 50, y: 15 },  // Top
      I: { x: 85, y: 50 },  // Right
      S: { x: 50, y: 85 },  // Bottom
      C: { x: 15, y: 50 }   // Left
    };
    return positions[type];
  };

  const getDiscColor = (type: 'D' | 'I' | 'S' | 'C') => {
    const colors = {
      D: '#ef4444',  // Red
      I: '#eab308',  // Yellow
      S: '#22c55e',  // Green
      C: '#3b82f6'   // Blue
    };
    return colors[type];
  };

  const primaryPos = getDiscPosition(primary);
  const secondaryPos = getDiscPosition(secondary);

  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28">
      {/* Outer decorative ring */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="#e2e8f0" strokeWidth="1" />
      
      {/* Background circle with gradient */}
      <defs>
        <radialGradient id="discGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3f4f6" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#discGradient)" />
      
      {/* Quadrant dividers */}
      <line x1="50" y1="5" x2="50" y2="95" stroke="#e2e8f0" strokeWidth="0.5" />
      <line x1="5" y1="50" x2="95" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />
      
      {/* Connecting line with gradient */}
      <defs>
        <linearGradient id="lineGradient" x1={primaryPos.x + "%"} y1={primaryPos.y + "%"} x2={secondaryPos.x + "%"} y2={secondaryPos.y + "%"}>
          <stop offset="0%" stopColor={getDiscColor(primary)} />
          <stop offset="100%" stopColor={getDiscColor(secondary)} />
        </linearGradient>
      </defs>
      <line
        x1={primaryPos.x}
        y1={primaryPos.y}
        x2={secondaryPos.x}
        y2={secondaryPos.y}
        stroke="url(#lineGradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* DISC points */}
      {(['D', 'I', 'S', 'C'] as const).map(type => {
        const pos = getDiscPosition(type);
        const isPrimary = type === primary;
        const isSecondary = type === secondary;
        const isActive = isPrimary || isSecondary;
        
        return (
          <g key={type}>
            {/* Glow effect for active points */}
            {isActive && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r="12"
                fill={getDiscColor(type)}
                opacity="0.15"
              />
            )}
            {/* Main circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={isActive ? 10 : 6}
              fill={isActive ? getDiscColor(type) : '#cbd5e1'}
              className={isActive ? 'filter drop-shadow-md' : ''}
            />
            {/* Letter */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={isActive ? "12" : "8"}
              fontWeight="bold"
              className="select-none"
            >
              {type}
            </text>
            {/* Label */}
            <text
              x={pos.x}
              y={pos.y + (type === 'D' ? -16 : type === 'S' ? 16 : 0)}
              dx={type === 'I' ? 16 : type === 'C' ? -16 : 0}
              textAnchor="middle"
              fill={isActive ? getDiscColor(type) : '#94a3b8'}
              fontSize="6"
              className="select-none"
            >
              {type === 'D' ? 'Dominance' :
               type === 'I' ? 'Influence' :
               type === 'S' ? 'Steadiness' :
               'Conscientiousness'}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default function Connections() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { setRecommendedUsers, recommendedUsers, interests, events } = useStore();

  useEffect(() => {
    const mockUsers = [
      {
        id: '1',
        name: 'Sarah Johnson',
        interests: ['1', '2'],
        attendingEvents: ['1'],
        connectionScore: 85,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        bio: 'Senior Software Engineer specializing in distributed systems',
        disc: {
          primary: 'C',
          secondary: 'D',
          description: 'Analytical Problem-Solver',
          workStyle: [
            'Detail-oriented and systematic approach',
            'Driven by accuracy and logic',
            'Excels in complex technical challenges',
            'Values data-driven decisions'
          ]
        }
      },
      {
        id: '2',
        name: 'Michael Chen',
        interests: ['1', '4'],
        attendingEvents: ['1'],
        connectionScore: 75,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        bio: 'Tech Lead with a passion for innovative solutions',
        disc: {
          primary: 'D',
          secondary: 'I',
          description: 'Strategic Innovator',
          workStyle: [
            'Results-driven leadership style',
            'Quick decision-maker',
            'Embraces challenging projects',
            'Strong initiative taker'
          ]
        }
      },
      {
        id: '3',
        name: 'Emma Davis',
        interests: ['1', '3'],
        attendingEvents: ['1'],
        connectionScore: 70,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        bio: 'Full-stack developer focused on user experience',
        disc: {
          primary: 'I',
          secondary: 'S',
          description: 'Collaborative Communicator',
          workStyle: [
            'Enthusiastic team player',
            'Creative problem-solver',
            'Excellent at building relationships',
            'Adaptable to change'
          ]
        }
      }
    ];

    setRecommendedUsers(mockUsers);
  }, [eventId, setRecommendedUsers]);

  const currentEvent = events.find(e => e.id === eventId) || {
    title: 'Tech Conference 2024',
    date: '2024-04-15',
    location: 'San Francisco, CA',
  };

  const getDiscColor = (type: 'D' | 'I' | 'S' | 'C') => {
    const colors = {
      D: 'bg-red-100 text-red-700',
      I: 'bg-yellow-100 text-yellow-700',
      S: 'bg-green-100 text-green-700',
      C: 'bg-blue-100 text-blue-700'
    };
    return colors[type];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Events
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{currentEvent.title}</h2>
              <p className="text-gray-600">
                {new Date(currentEvent.date).toLocaleDateString()} • {currentEvent.location}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Your Top Connections</h1>
        </div>

        <div className="space-y-6">
          {recommendedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-purple-600" />
                      <span className="text-lg font-semibold text-purple-600">
                        {user.connectionScore}% match
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{user.bio}</p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-600" />
                      <div className="flex flex-wrap gap-2">
                        {user.interests.map((interestId) => {
                          const interest = interests.find(i => i.id === interestId);
                          return interest ? (
                            <span
                              key={interestId}
                              className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm"
                            >
                              {interest.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-gray-800">DISC Profile</span>
                      </div>
                      <div className="flex items-start gap-6">
                        <DiscGraph 
                          primary={user.disc.primary} 
                          secondary={user.disc.secondary} 
                        />
                        <div className="flex-1">
                          <div className="flex gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDiscColor(user.disc.primary)}`}>
                              Primary: {user.disc.primary}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDiscColor(user.disc.secondary)}`}>
                              Secondary: {user.disc.secondary}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{user.disc.description}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-gray-800">Work Style</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {user.disc.workStyle.map((style, index) => (
                            <li key={index} className="text-gray-600 text-sm">{style}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}