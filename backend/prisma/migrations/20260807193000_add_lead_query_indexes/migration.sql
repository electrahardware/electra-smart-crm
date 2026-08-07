-- Accelerate the lead-list filters and follow-up queue without changing data.
CREATE INDEX "Lead_leadOwner_idx" ON "Lead"("leadOwner");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_followupDate_idx" ON "Lead"("followupDate");
CREATE INDEX "Lead_updatedAt_idx" ON "Lead"("updatedAt");
CREATE INDEX "Lead_city_idx" ON "Lead"("city");
CREATE INDEX "Lead_state_idx" ON "Lead"("state");
