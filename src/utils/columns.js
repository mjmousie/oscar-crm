/**
 * Maps semantic keys to possible raw column names from the scraper.
 * Add new aliases here as you encounter different export formats.
 */
export const COL_MAP = {
  name:                        ['name', 'business_name', 'company_name'],
  category:                    ['category', 'type', 'subtypes'],
  phone:                       ['phone'],
  website:                     ['website', 'url'],
  email:                       ['email'],
  address:                     ['address', 'full_address'],
  city:                        ['city'],
  state:                       ['state'],
  postal_code:                 ['postal_code', 'zip'],
  country:                     ['country'],
  street:                      ['street'],
  domain:                      ['domain'],
  rating:                      ['rating'],
  reviews:                     ['reviews', 'review_count'],
  // Social
  company_linkedin:            ['company_linkedin'],
  company_facebook:            ['company_facebook'],
  company_instagram:           ['company_instagram'],
  company_x:                   ['company_x'],
  company_youtube:             ['company_youtube'],
  // Contact person
  full_name:                   ['full_name'],
  first_name:                  ['first_name'],
  last_name:                   ['last_name'],
  title:                       ['title'],
  contact_phone:               ['contact_phone'],
  contact_linkedin:            ['contact_linkedin'],
  // Phone carrier
  carrier_name:                ['phone.phones_enricher.carrier_name'],
  carrier_type:                ['phone.phones_enricher.carrier_type'],
  // Email validation
  email_status:                ['email.emails_validator.status'],
  email_status_details:        ['email.emails_validator.status_details'],
  // Website technical
  website_title:               ['website_title'],
  website_description:         ['website_description'],
  website_generator:           ['website_generator'],
  website_has_gtm:             ['website_has_gtm'],
  website_has_fb_pixel:        ['website_has_fb_pixel'],
  // Business details
  business_status:             ['business_status'],
  working_hours:               ['working_hours'],
  time_zone:                   ['time_zone'],
  latitude:                    ['latitude'],
  longitude:                   ['longitude'],
  logo:                        ['logo'],
  photo:                       ['photo'],
  location_link:               ['location_link'],
  reviews_link:                ['reviews_link'],
  about:                       ['about'],
  description:                 ['description'],
  owner_title:                 ['owner_title'],
  verified:                    ['verified'],
  booking_appointment_link:    ['booking_appointment_link'],
  menu_link:                   ['menu_link'],
  range:                       ['range'],
  // Company insights
  company_insights_employees:  ['company_insights.employees'],
  company_insights_founded:    ['company_insights.founded_year'],
  company_insights_industry:   ['company_insights.industry'],
  company_insights_revenue:    ['company_insights.revenue'],
  company_insights_linkedin:   ['company_insights.linkedin_company_page'],
  company_insights_desc:       ['company_insights.description'],
  // IDs
  place_id:                    ['place_id'],
  google_id:                   ['google_id'],
  query:                       ['query'],
}

/**
 * Safely retrieve a value from a row using semantic key aliases.
 * Returns null if nothing is found or the value is empty/nan.
 */
export function getCol(row, key) {
  const candidates = COL_MAP[key] || [key]
  for (const c of candidates) {
    if (row[c] !== undefined && row[c] !== null && row[c] !== '') return row[c]
  }
  return null
}

/**
 * Format a raw value to a clean string, or null if empty/nan.
 */
export function fmt(val) {
  if (val === null || val === undefined || val === '') return null
  const s = String(val).trim()
  if (s === 'nan' || s === 'NaN' || s === 'undefined') return null
  return s
}

/**
 * Convenience: get + format in one call.
 */
export function g(row, key) {
  return fmt(getCol(row, key))
}
