-- 010_add_donor_location_fks (002-এর TEXT কলামে FK — locations 003-এর পরে)
-- NOTE: CockroachDB DO-ব্লকে ALTER সমর্থন করে না, তাই plain statement।
-- migrate runner সফল ফাইল ট্র্যাক করে, তাই double-apply হয় না।
ALTER TABLE donor_profiles ADD CONSTRAINT fk_donors_division FOREIGN KEY (division_id) REFERENCES divisions(id);
ALTER TABLE donor_profiles ADD CONSTRAINT fk_donors_district FOREIGN KEY (district_id) REFERENCES districts(id);
ALTER TABLE donor_profiles ADD CONSTRAINT fk_donors_upazila FOREIGN KEY (upazila_id) REFERENCES upazilas(id);
