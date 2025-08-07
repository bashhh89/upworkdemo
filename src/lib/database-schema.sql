-- Smart Proposal Generation System Database Schema
-- This schema is designed for future migration from localStorage to a proper database

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table - Core job records and applications
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    person_name VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    application_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'responded', 'rejected', 'hired', 'archived')),
    proposal_url VARCHAR(255) UNIQUE,
    company_analysis JSONB,
    tool_configuration JSONB,
    analytics JSONB,
    crm_record JSONB,
    notes JSONB,
    tags TEXT[],
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Proposals table - Generated proposals and their content
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    url_slug VARCHAR(255) UNIQUE NOT NULL,
    content JSONB NOT NULL,
    metadata JSONB,
    analytics_config JSONB,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Company analyses table - AI-generated company research
CREATE TABLE company_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_profile JSONB NOT NULL,
    opportunity_insights JSONB NOT NULL,
    competitive_analysis JSONB NOT NULL,
    recommended_tools JSONB NOT NULL,
    risk_assessment JSONB NOT NULL,
    analysis_timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Application recommendations table - AI recommendations for job applications
CREATE TABLE application_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id VARCHAR(255) UNIQUE NOT NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    should_apply BOOLEAN NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    reasoning_factors JSONB NOT NULL,
    suggested_approach TEXT,
    estimated_effort JSONB,
    success_probability DECIMAL(3,2) CHECK (success_probability >= 0 AND success_probability <= 1),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics events table - Proposal interaction tracking
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- CRM records table - Customer relationship management
CREATE TABLE crm_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id VARCHAR(255) UNIQUE NOT NULL,
    company_id VARCHAR(255) NOT NULL,
    deal_id VARCHAR(255),
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('lead', 'qualified', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost', 'on_hold')),
    value DECIMAL(12,2),
    probability DECIMAL(3,2) CHECK (probability >= 0 AND probability <= 1),
    expected_close_date DATE,
    last_contact_date TIMESTAMP,
    next_followup_date TIMESTAMP,
    relationship_score INTEGER CHECK (relationship_score >= 0 AND relationship_score <= 100),
    interactions JSONB,
    custom_fields JSONB,
    tags TEXT[],
    source VARCHAR(255),
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CRM contacts table - Individual contact information
CREATE TABLE crm_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    title VARCHAR(255),
    company_id VARCHAR(255) NOT NULL,
    linkedin_url TEXT,
    timezone VARCHAR(100),
    preferred_contact_method VARCHAR(50) CHECK (preferred_contact_method IN ('email', 'phone', 'linkedin')),
    communication_style JSONB,
    decision_making_role VARCHAR(50) CHECK (decision_making_role IN ('decision_maker', 'influencer', 'champion', 'gatekeeper', 'end_user', 'budget_holder')),
    personal_notes TEXT,
    tags TEXT[],
    custom_fields JSONB,
    last_contacted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CRM companies table - Company information
CREATE TABLE crm_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    website TEXT,
    industry VARCHAR(255),
    size VARCHAR(50) CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    revenue VARCHAR(255),
    location JSONB,
    description TEXT,
    founded_year INTEGER,
    tech_stack TEXT[],
    funding_status VARCHAR(50) CHECK (funding_status IN ('bootstrapped', 'seed', 'series_a', 'series_b', 'series_c', 'ipo', 'acquired')),
    parent_company VARCHAR(255),
    subsidiaries TEXT[],
    competitors TEXT[],
    tags TEXT[],
    custom_fields JSONB,
    social_profiles JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Blog posts table - Content management
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    categories TEXT[],
    tags TEXT[],
    published_at TIMESTAMP,
    seo_title VARCHAR(255),
    seo_description TEXT,
    featured_image TEXT,
    reading_time INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Blog categories table - Content categorization
CREATE TABLE blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Widgets table - System integrations and utilities
CREATE TABLE widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('integration', 'automation', 'analytics', 'utility')),
    enabled BOOLEAN DEFAULT false,
    configuration JSONB,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tool configurations table - Tool settings per job
CREATE TABLE tool_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    tool_id VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT false,
    customization JSONB,
    display_order INTEGER,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(job_id, tool_id)
);

-- Proposal components table - Reusable proposal building blocks
CREATE TABLE proposal_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('header', 'content', 'sidebar', 'footer', 'interactive')),
    template TEXT NOT NULL,
    variables JSONB,
    version INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Component versions table - Version control for components
CREATE TABLE component_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_id UUID REFERENCES proposal_components(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    template TEXT NOT NULL,
    variables JSONB,
    changelog TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(component_id, version)
);

-- User preferences table - System preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    preference_key VARCHAR(255) NOT NULL,
    preference_value JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, preference_key)
);

-- Performance metrics table - System performance tracking
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    load_time INTEGER,
    time_to_interactive INTEGER,
    first_contentful_paint INTEGER,
    largest_contentful_paint INTEGER,
    cumulative_layout_shift DECIMAL(5,3),
    error_count INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
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

CREATE INDEX idx_crm_records_contact_id ON crm_records(contact_id);
CREATE INDEX idx_crm_records_company_id ON crm_records(company_id);
CREATE INDEX idx_crm_records_stage ON crm_records(stage);
CREATE INDEX idx_crm_records_assigned_to ON crm_records(assigned_to);

CREATE INDEX idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX idx_crm_contacts_company_id ON crm_contacts(company_id);

CREATE INDEX idx_crm_companies_name ON crm_companies(name);
CREATE INDEX idx_crm_companies_industry ON crm_companies(industry);

CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);

CREATE INDEX idx_tool_configurations_job_id ON tool_configurations(job_id);
CREATE INDEX idx_tool_configurations_tool_id ON tool_configurations(tool_id);

CREATE INDEX idx_proposal_components_category ON proposal_components(category);
CREATE INDEX idx_component_versions_component_id ON component_versions(component_id);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_records_updated_at BEFORE UPDATE ON crm_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON crm_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_companies_updated_at BEFORE UPDATE ON crm_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_components_updated_at BEFORE UPDATE ON proposal_components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
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

-- Sample data migration functions (for future use)
CREATE OR REPLACE FUNCTION migrate_from_localstorage(data JSONB)
RETURNS VOID AS $$
BEGIN
    -- This function would handle migration from localStorage JSON data
    -- Implementation would depend on the specific data structure
    RAISE NOTICE 'Migration function called with data size: %', jsonb_array_length(data);
END;
$$ LANGUAGE plpgsql;

-- Cleanup functions
CREATE OR REPLACE FUNCTION cleanup_old_analytics(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_events 
    WHERE timestamp < NOW() - INTERVAL '%s days' % days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_inactive_proposals(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM proposals 
    WHERE is_active = false 
    AND updated_at < NOW() - INTERVAL '%s days' % days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;