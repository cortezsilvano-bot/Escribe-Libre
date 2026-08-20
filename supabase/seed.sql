-- Development-only synthetic data. Never execute against production.
insert into public.amenities(slug,name,category) values
('washer-dryer','Washer/dryer','laundry'),('air-conditioning','Air conditioning','climate'),('ev-charging','EV charging','parking'),
('step-free-entrance','Step-free entrance','accessibility'),('accessible-parking','Accessible parking','accessibility'),('pool','Pool','community'),('gym','Gym','community')
on conflict (slug) do nothing;

insert into public.feature_flags(key,enabled,configuration) values
('rentcast',false,'{}'),('ai_search',false,'{}'),('ai_summaries',false,'{}'),('sms',false,'{}'),('provider_billing',false,'{}')
on conflict (key) do update set enabled=excluded.enabled;

insert into public.application_settings(key,value) values
('direct_listing_expiration_days','45'),('ranking_version','"mvp-v1"'),('development_fixtures','{"synthetic":true,"market":"Houston, TX","count":108}')
on conflict (key) do update set value=excluded.value;
