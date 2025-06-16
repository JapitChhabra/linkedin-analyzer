import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  BriefcaseIcon,
  AcademicCapIcon,
  LightBulbIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const SkillsChart = ({ skills }) => {
  const data = {
    labels: skills.map(skill => skill.name),
    datasets: [
      {
        data: skills.map(skill => skill.endorsements),
        backgroundColor: [
          'rgba(14, 165, 233, 0.8)',
          'rgba(3, 105, 161, 0.8)',
          'rgba(55, 205, 190, 0.8)',
          'rgba(61, 68, 81, 0.8)',
        ],
        borderColor: 'transparent',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
};

const ExperienceTimeline = ({ experience }) => {
  // Calculate years for each experience (assuming current year for "Present")
  const calculateYears = (duration) => {
    const years = duration.split(' - ');
    const endYear = years[1] === 'Present' ? new Date().getFullYear() : parseInt(years[1]);
    const startYear = parseInt(years[0]);
    return endYear - startYear;
  };

  const data = {
    labels: experience.map(exp => exp.Company),
    datasets: [
      {
        label: 'Years',
        data: experience.map(exp => calculateYears(exp.Duration)),
        backgroundColor: 'rgba(14, 165, 233, 0.8)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Experience Timeline',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Years',
        },
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Bar data={data} options={options} />
    </div>
  );
};

const DetailedAnalysis = ({ profileData }) => {
  const {
    profile = {},
    experience = [],
    education = [],
    posts = [],
    skills = [],
    recommendations = [],
    profile_score = 0,
  } = profileData || {};

  return (
    <div className="grid gap-6">
      {/* Profile Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <UserIcon className="h-6 w-6 text-primary" />
            <h2 className="card-title">Profile Information</h2>
          </div>
          <div className="divider"></div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{profile.Name}</p>
            <p className="text-xl text-base-content/80">{profile.Designation}</p>
            <p className="text-lg text-base-content/70">{profile.Location}</p>
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-6 w-6 text-primary" />
            <h2 className="card-title">Professional Experience</h2>
          </div>
          <div className="divider"></div>
          {experience.length > 1 && <ExperienceTimeline experience={experience} />}
          <div className="mt-4 space-y-4">
            {experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold">{exp.Title}</h3>
                <p className="text-sm text-base-content/70">{exp.Company}</p>
                <p className="text-sm text-base-content/60">{exp.Duration}</p>
                <p className="text-sm text-base-content/60">{exp.Location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="h-6 w-6 text-primary" />
            <h2 className="card-title">Education</h2>
          </div>
          <div className="divider"></div>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold">{edu.Degree}</h3>
                <p className="text-sm text-base-content/70">{edu.School}</p>
                <p className="text-sm text-base-content/60">{edu.Duration}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      {posts && posts.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-primary" />
              <h2 className="card-title">Recent Posts</h2>
            </div>
            <div className="divider"></div>
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={index} className="chat chat-start">
                  <div className="chat-bubble chat-bubble-primary">
                    <p className="text-sm opacity-90">{post}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skills Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <LightBulbIcon className="h-6 w-6 text-primary" />
            <h2 className="card-title">Skills & Expertise</h2>
          </div>
          <div className="divider"></div>
          <SkillsChart skills={skills} />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="badge badge-primary">{skill.endorsements}</div>
                <span>{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6 text-primary" />
            <h2 className="card-title">Recommendations</h2>
          </div>
          <div className="divider"></div>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="chat chat-start">
                <div className="chat-bubble chat-bubble-primary">
                  <p className="font-medium">{rec.author}</p>
                  <p className="text-sm opacity-90">{rec.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Score Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-6 w-6 text-primary" />
            <h2 className="card-title">Profile Score Analysis</h2>
          </div>
          <div className="divider"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Overall Score</div>
                <div className="stat-value text-primary">
                  {Math.round(profile_score * 100)}%
                </div>
                <div className="stat-desc">Based on profile completeness</div>
              </div>
            </div>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Profile Strength</div>
                <div className="stat-value">
                  <progress
                    className="progress progress-primary w-56"
                    value={profile_score * 100}
                    max="100"
                  ></progress>
                </div>
                <div className="stat-desc">
                  {profile_score >= 0.8
                    ? 'All Star Profile'
                    : profile_score >= 0.6
                    ? 'Intermediate'
                    : 'Beginner'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysis; 