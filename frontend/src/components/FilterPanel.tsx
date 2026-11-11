import React from 'react';
import { RecommendationPreferences } from '../types';

interface FilterPanelProps {
  preferences: RecommendationPreferences;
  onRecommend: (event: React.FormEvent<HTMLFormElement>) => void;
  recommendationsLoading: boolean;
  recommendationError: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  preferences,
  onRecommend,
  recommendationsLoading,
  recommendationError,
}) => {
  const hasPreference = Object.values(preferences).some((value) => value.trim());

  return (
    <div className="kc-filter-body">
      <p className="kc-preference-help">
        Choose a size, switch type, and keycap profile in the carousels to find the closest keyboard.
      </p>
      <form className="kc-recommend-form" onSubmit={onRecommend}>
        <button type="submit" disabled={!hasPreference || recommendationsLoading}>
          {recommendationsLoading ? 'Finding keyboard...' : 'Find closest keyboard'}
        </button>
        {recommendationError && <p className="kc-recommend-error" role="alert">{recommendationError}</p>}
      </form>
    </div>
  );
};
