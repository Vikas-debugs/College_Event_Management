import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'deep-purple', trend }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-pale-purple/80 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</span>
        <div className="font-heading text-2xl font-bold text-text-dark">{value}</div>
        {subtitle && <p className="text-[11px] text-text-muted">{subtitle}</p>}
        {trend && (
          <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-pale-purple flex items-center justify-center text-deep-purple">
          <Icon className="w-6 h-6 text-deep-purple" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
