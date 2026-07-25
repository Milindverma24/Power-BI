CREATE TABLE business_goals (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    widget_id UUID NOT NULL,
    target_value DOUBLE PRECISION NOT NULL,
    start_value DOUBLE PRECISION NOT NULL,
    target_date TIMESTAMP NOT NULL,
    organization_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT fk_bg_widget FOREIGN KEY (widget_id) REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
    CONSTRAINT fk_bg_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE marketplace_prompts (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    prompt_text VARCHAR(1000) NOT NULL,
    category VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
