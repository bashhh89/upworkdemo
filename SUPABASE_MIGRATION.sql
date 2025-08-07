-- Smart Proposal Generation System - Supabase Migration
-- Run this SQL in your Supabase SQL Editor after localStorage testing is complete

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table - Core job records and applications
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    person_name VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'responded', 'rejected', 'hired', 'archived')),
    proposal_url VARCHAR(255) UNIQUE,
    company_analysis JSONB,
    tool_configuration JSONB DEFAULT '[]'::jsonb,
    analytics JSONB DEFAULT '{"proposalViews": 0, "timeSpentOnProposal": 0, "toolInteractions": 0, "conversionEvents": [], "engagementScore": 0}'::jsonb,
    crm_record JSONB,
    notes JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposals table - Generated proposals and their content
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    url_slug VARCHAR(255) UNIQUE NOT NULL,
    content JSONB NOT NULL,
    metadata JSONB NOT NULL,
    analytics_config JSONB DEFAULT '{"trackingEnabled": true, "heatmapEnabled": false, "recordingEnabled": false, "customEvents": [], "retentionPeriod": 90}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company analyses table - AI-generated company research
CREATE TABLE company_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_profile JSONB NOT NULL,
    opportunity_insights JSONB NOT NULL,
    competitive_analysis JSONB NOT NULL,
    recommended_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_assessment JSONB NOT NULL,
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application recommendations table - AI recommendations for job applications
CREATE TABLE application_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id VARCHAR(255) UNIQUE NOT NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    should_apply BOOLEAN NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    reasoning_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_approach TEXT,
    estimated_effort JSONB,
    success_probability DECIMAL(3,2) CHECK (success_probability >= 0 AND success_probability <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table - Proposal interaction tracking
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client questionnaires table - AI-powered animated forms
CREATE TABLE client_questionnaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT false,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    template JSONB NOT NULL,
    analytics JSONB DEFAULT '{"totalViews": 0, "totalStarted": 0, "totalCompleted": 0, "completionRate": 0, "averageTimeToComplete": 0, "dropOffPoints": [], "questionAnalytics": [], "responseDistribution": []}'::jsonb,
    settings JSONB NOT NULL DEFAULT '{"theme": {"primaryColor": "#3b82f6", "secondaryColor": "#64748b", "backgroundColor": "#ffffff", "textColor": "#1e293b", "fontFamily": "Inter", "borderRadius": 8, "spacing": "comfortable"}, "progressBar": {"enabled": true, "style": "bar", "position": "top", "showPercentage": true, "color": "#3b82f6"}, "navigation": {"showPrevious": true, "showNext": true, "allowSkip": false, "autoAdvance": false, "autoAdvanceDelay": 0, "keyboardNavigation": true}, "completion": {"thankYouMessage": "Thank you for your responses!", "redirectDelay": 3000, "showSummary": true, "allowEdit": false, "sendConfirmationEmail": false}, "branding": {"companyName": "Ahmad Basheer"}}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questionnaire responses table - Client form submissions
CREATE TABLE questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    questionnaire_id UUID REFERENCES client_questionnaires(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    responses JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0 -- in seconds
);

-- Blog posts table - Content management
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    featured_image TEXT,
    reading_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Widgets table - System integrations and utilities
CREATE TABLE widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('integration', 'automation', 'analytics', 'utility')),
    enabled BOOLEAN DEFAULT false,
    configuration JSONB DEFAULT '{}'::jsonb,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table - System preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL DEFAULT 'default_user',
    preference_key VARCHAR(255) NOT NULL,
    preference_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, preference_key)
);

-- Create indexes for better query performance
CREATE INDEX idx_jobs_company_name ON jobs(company_name);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_jobs_application_date ON jobs(application_date);

CREATE INDEX idx_proposals_job_id ON proposals(job_id);
CREATE INDEX idx_proposals_url_slug ON proposals(url_slug);
CREATE INDEX idx_proposals_is_active ON proposals(is_active);

CREATE INDEX idx_company_analyses_company_name ON company_analyses(company_name);
CREATE INDEX idx_company_analyses_timestamp ON company_analyses(analysis_timestamp);

CREATE INDEX idx_analytics_events_proposal_id ON analytics_events(proposal_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

CREATE INDEX idx_questionnaires_proposal_id ON client_questionnaires(proposal_id);
CREATE INDEX idx_questionnaires_enabled ON client_questionnaires(enabled);

CREATE INDEX idx_questionnaire_responses_questionnaire_id ON questionnaire_responses(questionnaire_id);
CREATE INDEX idx_questionnaire_responses_status ON questionnaire_responses(status);
CREATE INDEX idx_questionnaire_responses_session_id ON questionnaire_responses(session_id);

CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaires_updated_at BEFORE UPDATE ON client_questionnaires
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE VIEW active_jobs AS
SELECT * FROM jobs 
WHERE status NOT IN ('rejected', 'hired', 'archived')
ORDER BY created_at DESC;

CREATE VIEW recent_proposals AS
SELECT p.*, j.company_name, j.person_name
FROM proposals p
JOIN jobs j ON p.job_id = j.id
WHERE p.is_active = true
ORDER BY p.created_at DESC;

CREATE VIEW proposal_analytics_summary AS
SELECT 
    p.id as proposal_id,
    p.url_slug,
    j.company_name,
    COUNT(ae.id) as total_events,
    COUNT(DISTINCT ae.session_id) as unique_sessions,
    MAX(ae.timestamp) as last_activity
FROM proposals p
JOIN jobs j ON p.job_id = j.id
LEFT JOIN analytics_events ae ON p.id = ae.proposal_id
WHERE p.is_active = true
GROUP BY p.id, p.url_slug, j.company_name
ORDER BY last_activity DESC;

-- Enable Row Level Security (RLS) for multi-tenant support (optional)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust as needed)
CREATE POLICY "Users can manage their own jobs" ON jobs
    FOR ALL USING (true); -- Adjust this based on your auth setup

CREATE POLICY "Users can manage their own proposals" ON proposals
    FOR ALL USING (true);

CREATE POLICY "Users can manage their own analyses" ON company_analyses
    FOR ALL USING (true);

CREATE POLICY "Users can manage their own recommendations" ON application_recommendations
    FOR ALL USING (true);

CREATE POLICY "Users can manage their own analytics" ON analytics_events
    FOR ALL USING (true);

CREATE POLICY "Users can manage their own questionnaires" ON client_questionnaires
    FOR ALL USING (true);

CREATE POLICY "Anyone can submit questionnaire responses" ON questionnaire_responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their questionnaire responses" ON questionnaire_responses
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own blog posts" ON blog_posts
    FOR ALL USING (true);

CREATE POLICY "Users can manage their own widgets" ON widgets
    FOR ALL USING (true);

CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (true);

-- Insert some default data
INSERT INTO widgets (name, description, type, enabled, configuration) VALUES
('Email Integration', 'Connect with email providers for automated follow-ups', 'integration', false, '{"provider": "", "apiKey": ""}'),
('Calendar Sync', 'Sync meetings and deadlines with calendar apps', 'integration', false, '{"provider": "", "calendarId": ""}'),
('Analytics Dashboard', 'Advanced analytics and reporting', 'analytics', true, '{"refreshInterval": 300}'),
('Backup Utility', 'Automated data backup and export', 'utility', true, '{"frequency": "daily", "retention": 30}');

-- Insert default questionnaire templates
INSERT INTO client_questionnaires (id, proposal_id, job_id, enabled, title, description, questions, template, settings) VALUES
(uuid_generate_v4(), uuid_generate_v4(), uuid_generate_v4(), false, 'Web Development Project Requirements', 'Help us understand your project needs', 
'[
  {
    "id": "project_type",
    "type": "radio",
    "title": "What type of website do you need?",
    "required": true,
    "order": 1,
    "options": [
      {"id": "business", "label": "Business Website", "value": "business"},
      {"id": "ecommerce", "label": "E-commerce Store", "value": "ecommerce"},
      {"id": "portfolio", "label": "Portfolio Site", "value": "portfolio"},
      {"id": "blog", "label": "Blog/Content Site", "value": "blog"}
    ]
  },
  {
    "id": "budget_range",
    "type": "slider",
    "title": "What is your budget range?",
    "required": true,
    "order": 2,
    "validation": {"min": 1000, "max": 50000}
  },
  {
    "id": "timeline",
    "type": "select",
    "title": "When do you need this completed?",
    "required": true,
    "order": 3,
    "options": [
      {"id": "asap", "label": "ASAP (Rush job)", "value": "asap"},
      {"id": "month", "label": "Within 1 month", "value": "1_month"},
      {"id": "quarter", "label": "Within 3 months", "value": "3_months"},
      {"id": "flexible", "label": "Flexible timeline", "value": "flexible"}
    ]
  }
]'::jsonb,
'{"id": "web_dev_template", "name": "Web Development Template", "category": "web_development", "isDefault": true}'::jsonb,
'{"theme": {"primaryColor": "#3b82f6", "secondaryColor": "#64748b", "backgroundColor": "#ffffff", "textColor": "#1e293b", "fontFamily": "Inter", "borderRadius": 8, "spacing": "comfortable"}}'::jsonb);

-- Success message
SELECT 'Smart Proposal Generation System database setup complete! 🎉' as message;