import React from 'react';

export const MeshBackground: React.FC = () => {
  return (
    <div className="ambient-mesh-bg" aria-hidden="true">
      <div className="ambient-mesh-orb orb-1" />
      <div className="ambient-mesh-orb orb-2" />
      <div className="ambient-mesh-orb orb-3" />
    </div>
  );
};
