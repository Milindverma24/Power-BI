CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_department_organization FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);

ALTER TABLE users 
ADD COLUMN organization_id UUID,
ADD COLUMN department_id UUID,
ADD CONSTRAINT fk_user_organization FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL;
