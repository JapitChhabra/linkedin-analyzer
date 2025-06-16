import React from 'react';
import PropTypes from 'prop-types';

const StatsCard = ({ icon: Icon, title, value, description }) => {
  return (
    <div className="stats shadow bg-base-100">
      <div className="stat">
        <div className="stat-figure text-primary">
          <Icon className="w-8 h-8" />
        </div>
        <div className="stat-title">{title}</div>
        <div className="stat-value text-primary">{value}</div>
        <div className="stat-desc">{description}</div>
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string.isRequired,
};

export default StatsCard; 