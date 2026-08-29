// ─── Language Configuration ───────────────────────────────────────────────────
// Change DEFAULT_LANGUAGE to "BN" to switch the entire UI to Bengali.
// Allowed values: "EN" | "BN"
export const DEFAULT_LANGUAGE = "BN";

// ─── Translation Map ──────────────────────────────────────────────────────────
// Every user-visible string in the application appears here in both languages.
// Keys are the canonical English strings; values are objects with EN and BN.
const translations = {

  // ── Navigation / Sidebar ──────────────────────────────────────────────────
  "Basic Setup":                              { EN: "Basic Setup",                              BN: "মৌলিক সেটআপ" },
  "Head Office":                              { EN: "Head Office",                              BN: "প্রধান কার্যালয়" },
  "Circle Office":                            { EN: "Circle Office",                            BN: "তত্ত্বাবধায়ক প্রকৌশলীর কার্যালয়" },
  "District Office":                          { EN: "District Office",                          BN: "নির্বাহী প্রকৌশলীর কার্যালয়" },
  "Office":                                   { EN: "Office",                                   BN: "অফিস" },
  "Designation":                              { EN: "Designation",                              BN: "পদবী" },
  "Month Cycle":                              { EN: "Month Cycle",                              BN: "মাসিক চক্র" },
  "Product":                                  { EN: "Product",                                  BN: "পণ্য" },
  "Product Group":                            { EN: "Product Group",                            BN: "পণ্য গ্রুপ" },
  "Manufacture Company":                      { EN: "Manufacture Company",                      BN: "উৎপাদন কোম্পানি" },
  "Product Information":                      { EN: "Product Information",                      BN: "পণ্যের তথ্য" },
  "Product Opening Balance":                  { EN: "Product Opening Balance",                  BN: "পণ্যের প্রারম্ভিক উদ্বৃত্ত" },
  "Supplier":                                 { EN: "Supplier",                                 BN: "সরবরাহকারী" },
  "Customer":                                 { EN: "Customer",                                 BN: "গ্রাহক" },
  "Transaction":                              { EN: "Transaction",                              BN: "লেনদেন" },
  "Stock Register / Purchase":                { EN: "Stock Register / Purchase",                BN: "স্টক রেজিস্টার / ক্রয়" },
  "Item Distribution":                        { EN: "Item Distribution",                        BN: "পণ্য বিতরণ" },
  "Purchase Returns":                         { EN: "Purchase Returns",                         BN: "ক্রয় ফেরত" },
  "Sales Returns":                            { EN: "Sales Returns",                            BN: "বিক্রয় ফেরত" },
  "Damage":                                   { EN: "Damage",                                   BN: "ক্ষতি" },
  "Purchase Planning":                        { EN: "Purchase Planning",                        BN: "ক্রয় পরিকল্পনা" },
  "Users":                                    { EN: "Users",                                    BN: "ব্যবহারকারী" },
  "User Registration":                        { EN: "User Registration",                        BN: "ব্যবহারকারী নিবন্ধন" },
  "User Role":                                { EN: "User Role",                                BN: "ব্যবহারকারীর ভূমিকা" },
  "User Permission":                          { EN: "User Permission",                          BN: "ব্যবহারকারীর অনুমতি" },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  "Overview":                                 { EN: "Overview",                                 BN: "সংক্ষিপ্ত বিবরণ" },
  "Dashboard":                                { EN: "Dashboard",                                BN: "ড্যাশবোর্ড" },
  "Welcome to the inventory management system.": { EN: "Welcome to the inventory management system.", BN: "ইনভেন্টরি ম্যানেজমেন্ট সিস্টেমে স্বাগতম।" },
  "Admin workflow panel":                     { EN: "Admin workflow panel",                     BN: "অ্যাডমিন ওয়ার্কফ্লো প্যানেল" },
  "Planned":                                  { EN: "Planned",                                  BN: "পরিকল্পিত" },
  "Priority":                                 { EN: "Priority",                                 BN: "অগ্রাধিকার" },
  "Coverage":                                 { EN: "Coverage",                                 BN: "কভারেজ" },
  "Purchase plans in preparation.":           { EN: "Purchase plans in preparation.",           BN: "ক্রয় পরিকল্পনা প্রস্তুতিতে।" },
  "Critical items flagged for quick action.": { EN: "Critical items flagged for quick action.", BN: "দ্রুত পদক্ষেপের জন্য গুরুত্বপূর্ণ আইটেম চিহ্নিত।" },
  "Estimated stock cover from current planning.": { EN: "Estimated stock cover from current planning.", BN: "বর্তমান পরিকল্পনা থেকে আনুমানিক স্টক কভার।" },
  "Roles":                                    { EN: "Roles",                                    BN: "ভূমিকা" },
  "Mapped":                                   { EN: "Mapped",                                   BN: "ম্যাপ করা" },
  "Review":                                   { EN: "Review",                                   BN: "পর্যালোচনা" },
  "Configured role definitions.":             { EN: "Configured role definitions.",             BN: "কনফিগার করা ভূমিকার সংজ্ঞা।" },
  "Users assigned to at least one role.":     { EN: "Users assigned to at least one role.",     BN: "কমপক্ষে একটি ভূমিকায় নিযুক্ত ব্যবহারকারী।" },
  "Roles waiting for policy review.":         { EN: "Roles waiting for policy review.",         BN: "নীতি পর্যালোচনার জন্য অপেক্ষমান ভূমিকা।" },
  "Policies":                                 { EN: "Policies",                                 BN: "নীতিমালা" },
  "Critical":                                 { EN: "Critical",                                 BN: "গুরুত্বপূর্ণ" },
  "Audit":                                    { EN: "Audit",                                    BN: "নিরীক্ষা" },
  "Permission rules currently enforced.":     { EN: "Permission rules currently enforced.",     BN: "বর্তমানে কার্যকর অনুমতির নিয়ম।" },
  "Restricted actions requiring approval.":   { EN: "Restricted actions requiring approval.",   BN: "অনুমোদনের প্রয়োজন সীমাবদ্ধ কার্যক্রম।" },
  "No permission conflicts flagged.":         { EN: "No permission conflicts flagged.",         BN: "কোনো অনুমতির দ্বন্দ্ব চিহ্নিত নয়।" },

  // ── Header / Branding ─────────────────────────────────────────────────────
  "Government of Bangladesh":                 { EN: "Government of Bangladesh",                 BN: "বাংলাদেশ সরকার" },
  "Directorate of Education Engineering":     { EN: "Directorate of Education Engineering",     BN: "শিক্ষা প্রকৌশল অধিদপ্তর" },
  "Change Photo":                             { EN: "Change Photo",                             BN: "ছবি পরিবর্তন" },
  "Profile":                                  { EN: "Profile",                                  BN: "প্রোফাইল" },
  "Logout":                                   { EN: "Logout",                                   BN: "লগআউট" },
  "items":                                    { EN: "items",                                    BN: "আইটেম" },

  // ── Login ─────────────────────────────────────────────────────────────────
  "Sign in":                                  { EN: "Sign in",                                  BN: "সাইন ইন" },
  "Sign In":                                  { EN: "Sign In",                                  BN: "সাইন ইন" },
  "Username":                                 { EN: "Username",                                 BN: "ব্যবহারকারী নাম" },
  "Password":                                 { EN: "Password",                                 BN: "পাসওয়ার্ড" },
  "Invalid username or password.":            { EN: "Invalid username or password.",            BN: "ব্যবহারকারীর নাম অথবা পাসওয়ার্ড সঠিক হয়নি। আবার চেষ্টা করুন।" },
  "Signing in…":                              { EN: "Signing in…",                              BN: "সাইন ইন হচ্ছে…" },
  "Stock & Inventory Management System":      { EN: "Stock & Inventory Management System",      BN: "স্টক ও ইনভেন্টরি ব্যবস্থাপনা সিস্টেম" },
  "Enter your credentials to continue":       { EN: "Enter your credentials to continue",       BN: "চালিয়ে যেতে আপনার তথ্য প্রবেশ করান" },
  "All rights reserved.":                     { EN: "All rights reserved.",                     BN: "সর্বস্বত্ব সংরক্ষিত।" },

  // ── Common Actions / Buttons ──────────────────────────────────────────────
  "Add":                                      { EN: "Add",                                      BN: "যোগ করুন" },
  "+ Add":                                    { EN: "+ Add",                                    BN: "+ যোগ করুন" },
  "Edit":                                     { EN: "Edit",                                     BN: "সম্পাদনা" },
  "Save":                                     { EN: "Save",                                     BN: "সংরক্ষণ" },
  "Cancel":                                   { EN: "Cancel",                                   BN: "বাতিল" },
  "Clear":                                    { EN: "Clear",                                    BN: "মুছুন" },
  "Delete":                                   { EN: "Delete",                                   BN: "মুছুন" },
  "Register":                                 { EN: "Register",                                 BN: "নিবন্ধন" },
  "+ Register":                               { EN: "+ Register",                               BN: "+ নিবন্ধন" },
  "Save Changes":                             { EN: "Save Changes",                             BN: "পরিবর্তন সংরক্ষণ" },
  "Saving…":                                  { EN: "Saving…",                                  BN: "সংরক্ষণ হচ্ছে…" },
  "Registering…":                             { EN: "Registering…",                             BN: "নিবন্ধন হচ্ছে…" },
  "Loading…":                                 { EN: "Loading…",                                 BN: "লোড হচ্ছে…" },
  "Saved":                                    { EN: "Saved",                                    BN: "সংরক্ষিত" },

  // ── Common Table / List Labels ────────────────────────────────────────────
  "#":                                        { EN: "#",                                        BN: "#" },
  "Action":                                   { EN: "Action",                                   BN: "কার্যক্রম" },
  "Showing":                                  { EN: "Showing",                                  BN: "দেখানো হচ্ছে" },
  "of":                                       { EN: "of",                                       BN: "এর মধ্যে" },
  "for":                                      { EN: "for",                                      BN: "এর জন্য" },
  "Address":                                  { EN: "Address",                                  BN: "ঠিকানা" },
  "Full address":                             { EN: "Full address",                             BN: "সম্পূর্ণ ঠিকানা" },
  "Contact":                                  { EN: "Contact",                                  BN: "যোগাযোগ" },
  "Contact No.":                              { EN: "Contact No.",                              BN: "যোগাযোগ নম্বর" },
  "Mobile No.":                               { EN: "Mobile No.",                               BN: "মোবাইল নম্বর" },
  "Phone or email":                           { EN: "Phone or email",                           BN: "ফোন বা ইমেইল" },
  "Office address":                           { EN: "Office address",                           BN: "অফিসের ঠিকানা" },
  "Shipping Address":                         { EN: "Shipping Address",                         BN: "শিপিং ঠিকানা" },
  "Delivery / shipping address":              { EN: "Delivery / shipping address",              BN: "ডেলিভারি / শিপিং ঠিকানা" },
  "Auto-generated":                           { EN: "Auto-generated",                           BN: "স্বয়ংক্রিয়ভাবে তৈরি" },
  "Role":                                     { EN: "Role",                                     BN: "ভূমিকা" },
  "Date":                                     { EN: "Date",                                     BN: "তারিখ" },
  "Date *":                                   { EN: "Date *",                                   BN: "তারিখ *" },
  "Remark":                                   { EN: "Remark",                                   BN: "মন্তব্য" },
  "Optional remark":                          { EN: "Optional remark",                          BN: "ঐচ্ছিক মন্তব্য" },
  "Quantity":                                 { EN: "Quantity",                                 BN: "পরিমাণ" },

  // ── Common Error / Status Messages ───────────────────────────────────────
  "Select a product.":                        { EN: "Select a product.",                        BN: "একটি পণ্য নির্বাচন করুন।" },
  "Enter a valid quantity.":                  { EN: "Enter a valid quantity.",                  BN: "সঠিক পরিমাণ প্রবেশ করুন।" },
  "Date is required.":                        { EN: "Date is required.",                        BN: "তারিখ আবশ্যক।" },
  "Failed to save item.":                     { EN: "Failed to save item.",                     BN: "আইটেম সংরক্ষণ করতে ব্যর্থ হয়েছে।" },
  "Delete failed.":                           { EN: "Delete failed.",                           BN: "মুছতে ব্যর্থ হয়েছে।" },
  "-- Select Product --":                     { EN: "-- Select Product --",                     BN: "-- পণ্য নির্বাচন করুন --" },

  // ── User Registration ─────────────────────────────────────────────────────
  "Search by name, mobile, designation…":     { EN: "Search by name, mobile, designation…",    BN: "নাম, মোবাইল, পদবী দিয়ে অনুসন্ধান করুন…" },
  "Loading users…":                           { EN: "Loading users…",                           BN: "ব্যবহারকারী লোড হচ্ছে…" },
  "No users found for":                       { EN: "No users found for",                       BN: "কোনো ব্যবহারকারী পাওয়া যায়নি" },
  "No users registered yet.":                 { EN: "No users registered yet.",                 BN: "এখনো কোনো ব্যবহারকারী নিবন্ধিত নয়।" },
  "users":                                    { EN: "users",                                    BN: "ব্যবহারকারী" },
  "Register New User":                        { EN: "Register New User",                        BN: "নতুন ব্যবহারকারী নিবন্ধন" },
  "Username *":                               { EN: "Username *",                               BN: "ব্যবহারকারী নাম *" },
  "Full name or username":                    { EN: "Full name or username",                    BN: "পুরো নাম বা ব্যবহারকারী নাম" },
  "Email *":                                  { EN: "Email *",                                  BN: "ইমেইল *" },
  "-- Select district office --":             { EN: "-- Select district office --",             BN: "-- নির্বাহী প্রকৌশলীর কার্যালয় নির্বাচন করুন --" },
  "Add new district office":                  { EN: "Add new district office",                  BN: "নতুন নির্বাহী প্রকৌশলীর কার্যালয় যোগ করুন" },
  "Office Name":                              { EN: "Office Name",                              BN: "অফিসের নাম" },
  "-- Select office --":                      { EN: "-- Select office --",                      BN: "-- অফিস নির্বাচন করুন --" },
  "Add new office":                           { EN: "Add new office",                           BN: "নতুন অফিস যোগ করুন" },
  "e.g. Officer":                             { EN: "e.g. Officer",                             BN: "যেমন: কর্মকর্তা" },
  "-- Select role --":                        { EN: "-- Select role --",                        BN: "-- ভূমিকা নির্বাচন করুন --" },
  "Add new role":                             { EN: "Add new role",                             BN: "নতুন ভূমিকা যোগ করুন" },
  "Password *":                               { EN: "Password *",                               BN: "পাসওয়ার্ড *" },
  "Minimum 8 characters":                     { EN: "Minimum 8 characters",                    BN: "কমপক্ষে ৮ অক্ষর" },
  "e.g. 01700000000":                         { EN: "e.g. 01700000000",                         BN: "যেমন: ০১৭০০০০০০০০" },
  "Edit User —":                              { EN: "Edit User —",                              BN: "ব্যবহারকারী সম্পাদনা —" },

  // ── Product ───────────────────────────────────────────────────────────────
  "Search by product name…":                  { EN: "Search by product name…",                 BN: "পণ্যের নাম দিয়ে অনুসন্ধান করুন…" },
  "Prod Code":                                { EN: "Prod Code",                                BN: "পণ্য কোড" },
  "Product Name":                             { EN: "Product Name",                             BN: "পণ্যের নাম" },
  "Group":                                    { EN: "Group",                                    BN: "গ্রুপ" },
  "Manufacturer":                             { EN: "Manufacturer",                             BN: "প্রস্তুতকারক" },
  "MRP":                                      { EN: "MRP",                                      BN: "সর্বোচ্চ খুচরা মূল্য" },
  "No products found for":                    { EN: "No products found for",                    BN: "কোনো পণ্য পাওয়া যায়নি" },
  "No products added yet.":                   { EN: "No products added yet.",                   BN: "এখনো কোনো পণ্য যোগ করা হয়নি।" },
  "No products found.":                       { EN: "No products found.",                       BN: "কোনো পণ্য পাওয়া যায়নি।" },
  "products":                                 { EN: "products",                                 BN: "পণ্য" },
  "Add Product":                              { EN: "Add Product",                              BN: "পণ্য যোগ করুন" },
  "Product Group *":                          { EN: "Product Group *",                          BN: "পণ্য গ্রুপ *" },
  "— Select group —":                         { EN: "— Select group —",                         BN: "— গ্রুপ নির্বাচন করুন —" },
  "— None —":                                 { EN: "— None —",                                 BN: "— কোনোটি নয় —" },
  "Product Name *":                           { EN: "Product Name *",                           BN: "পণ্যের নাম *" },
  "e.g. A4 Paper Ream":                       { EN: "e.g. A4 Paper Ream",                       BN: "যেমন: এ৪ পেপার রিম" },
  "Unit":                                     { EN: "Unit",                                     BN: "একক" },
  "e.g. Ream, Piece":                         { EN: "e.g. Ream, Piece",                         BN: "যেমন: রিম, পিস" },
  "Edit —":                                   { EN: "Edit —",                                   BN: "সম্পাদনা —" },

  // ── Head Office ───────────────────────────────────────────────────────────
  "No head offices added yet.":               { EN: "No head offices added yet.",               BN: "এখনো কোনো প্রধান কার্যালয় যোগ করা হয়নি।" },
  "offices":                                  { EN: "offices",                                  BN: "অফিস" },
  "Add Head Office":                          { EN: "Add Head Office",                          BN: "প্রধান কার্যালয় যোগ করুন" },
  "Office Name *":                            { EN: "Office Name *",                            BN: "অফিসের নাম *" },
  "e.g. Directorate Head Office":             { EN: "e.g. Directorate Head Office",             BN: "যেমন: অধিদপ্তর প্রধান কার্যালয়" },
  "Office Address":                           { EN: "Office Address",                           BN: "অফিসের ঠিকানা" },

  // ── District Office ───────────────────────────────────────────────────────
  "Search by name or address…":               { EN: "Search by name or address…",               BN: "নাম বা ঠিকানা দিয়ে অনুসন্ধান করুন…" },
  "District Office Name":                     { EN: "District Office Name",                     BN: "নির্বাহী প্রকৌশলীর কার্যালয়ের নাম" },
  "No district offices found for":            { EN: "No district offices found for",            BN: "কোনো নির্বাহী প্রকৌশলীর কার্যালয় পাওয়া যায়নি" },
  "No district offices added yet.":           { EN: "No district offices added yet.",           BN: "এখনো কোনো নির্বাহী প্রকৌশলীর কার্যালয় যোগ করা হয়নি।" },
  "Add District Office":                      { EN: "Add District Office",                      BN: "নির্বাহী প্রকৌশলীর কার্যালয় যোগ করুন" },
  "District Office Name *":                   { EN: "District Office Name *",                   BN: "নির্বাহী প্রকৌশলীর কার্যালয়ের নাম *" },
  "e.g. Dhaka District Office":               { EN: "e.g. Dhaka District Office",               BN: "যেমন: ঢাকা নির্বাহী প্রকৌশলীর কার্যালয়" },

  // ── Circle Office ─────────────────────────────────────────────────────────
  "Circle Office Name":                       { EN: "Circle Office Name",                       BN: "তত্ত্বাবধায়ক প্রকৌশলীর কার্যালয়ের নাম" },
  "No circle offices found for":              { EN: "No circle offices found for",              BN: "কোনো তত্ত্বাবধায়ক প্রকৌশলীর কার্যালয় পাওয়া যায়নি" },
  "No circle offices added yet.":             { EN: "No circle offices added yet.",             BN: "এখনো কোনো তত্ত্বাবধায়ক প্রকৌশলীর কার্যালয় যোগ করা হয়নি।" },
  "Add Circle Office":                        { EN: "Add Circle Office",                        BN: "তত্ত্বাবধায়ক প্রকৌশলীর কার্যালয় যোগ করুন" },
  "Circle Office Name *":                     { EN: "Circle Office Name *",                     BN: "তত্ত্বাবধায়ক প্রকৌশলীর কার্যালয়ের নাম *" },
  "e.g. Dhaka Circle Office":                 { EN: "e.g. Dhaka Circle Office",                 BN: "যেমন: ঢাকা তত্ত্বাবধায়ক প্রকৌশলীর কার্যালয়" },

  // ── Designation ───────────────────────────────────────────────────────────
  "Search by name…":                          { EN: "Search by name…",                          BN: "নাম দিয়ে অনুসন্ধান করুন…" },
  "Designation Name":                         { EN: "Designation Name",                         BN: "পদবীর নাম" },
  "No designations found for":               { EN: "No designations found for",                BN: "কোনো পদবী পাওয়া যায়নি" },
  "No designations added yet.":              { EN: "No designations added yet.",               BN: "এখনো কোনো পদবী যোগ করা হয়নি।" },
  "designations":                             { EN: "designations",                             BN: "পদবী" },
  "Add Designation":                          { EN: "Add Designation",                          BN: "পদবী যোগ করুন" },
  "Designation Name *":                       { EN: "Designation Name *",                       BN: "পদবীর নাম *" },
  "e.g. Assistant Engineer":                  { EN: "e.g. Assistant Engineer",                  BN: "যেমন: সহকারী প্রকৌশলী" },

  // ── Month Cycle ───────────────────────────────────────────────────────────
  "Search by cycle name…":                    { EN: "Search by cycle name…",                    BN: "চক্রের নাম দিয়ে অনুসন্ধান করুন…" },
  "Cycle Name":                               { EN: "Cycle Name",                               BN: "চক্রের নাম" },
  "Month":                                    { EN: "Month",                                    BN: "মাস" },
  "Year":                                     { EN: "Year",                                     BN: "বছর" },
  "Start Date":                               { EN: "Start Date",                               BN: "শুরুর তারিখ" },
  "End Date":                                 { EN: "End Date",                                 BN: "শেষ তারিখ" },
  "Days":                                     { EN: "Days",                                     BN: "দিন" },
  "days":                                     { EN: "days",                                     BN: "দিন" },
  "No month cycles found for":               { EN: "No month cycles found for",                BN: "কোনো মাসিক চক্র পাওয়া যায়নি" },
  "No month cycles added yet.":              { EN: "No month cycles added yet.",               BN: "এখনো কোনো মাসিক চক্র যোগ করা হয়নি।" },
  "cycles":                                   { EN: "cycles",                                   BN: "চক্র" },
  "Add Month Cycle":                          { EN: "Add Month Cycle",                          BN: "মাসিক চক্র যোগ করুন" },
  "Cycle Name *":                             { EN: "Cycle Name *",                             BN: "চক্রের নাম *" },
  "e.g. January Cycle":                       { EN: "e.g. January Cycle",                       BN: "যেমন: জানুয়ারি চক্র" },
  "— Select month —":                         { EN: "— Select month —",                         BN: "— মাস নির্বাচন করুন —" },
  "— Select year —":                          { EN: "— Select year —",                          BN: "— বছর নির্বাচন করুন —" },
  "Duration:":                                { EN: "Duration:",                                BN: "সময়কাল:" },

  // ── Product Group ─────────────────────────────────────────────────────────
  "Search by group name…":                    { EN: "Search by group name…",                    BN: "গ্রুপের নাম দিয়ে অনুসন্ধান করুন…" },
  "Group Code":                               { EN: "Group Code",                               BN: "গ্রুপ কোড" },
  "Group Name":                               { EN: "Group Name",                               BN: "গ্রুপের নাম" },
  "No product groups found for":             { EN: "No product groups found for",              BN: "কোনো পণ্য গ্রুপ পাওয়া যায়নি" },
  "No product groups added yet.":            { EN: "No product groups added yet.",             BN: "এখনো কোনো পণ্য গ্রুপ যোগ করা হয়নি।" },
  "groups":                                   { EN: "groups",                                   BN: "গ্রুপ" },
  "Add Product Group":                        { EN: "Add Product Group",                        BN: "পণ্য গ্রুপ যোগ করুন" },
  "Group Name *":                             { EN: "Group Name *",                             BN: "গ্রুপের নাম *" },
  "e.g. Stationery":                          { EN: "e.g. Stationery",                          BN: "যেমন: স্টেশনারি" },

  // ── Manufacture Company ───────────────────────────────────────────────────
  "Search by company name…":                  { EN: "Search by company name…",                  BN: "কোম্পানির নাম দিয়ে অনুসন্ধান করুন…" },
  "Company Name":                             { EN: "Company Name",                             BN: "কোম্পানির নাম" },
  "No companies found for":                  { EN: "No companies found for",                   BN: "কোনো কোম্পানি পাওয়া যায়নি" },
  "No manufacture companies added yet.":     { EN: "No manufacture companies added yet.",      BN: "এখনো কোনো উৎপাদন কোম্পানি যোগ করা হয়নি।" },
  "companies":                                { EN: "companies",                                BN: "কোম্পানি" },
  "Add Manufacture Company":                  { EN: "Add Manufacture Company",                  BN: "উৎপাদন কোম্পানি যোগ করুন" },
  "Company Name *":                           { EN: "Company Name *",                           BN: "কোম্পানির নাম *" },
  "e.g. Acme Corp":                           { EN: "e.g. Acme Corp",                           BN: "যেমন: একমি কর্প" },
  "e.g. 01XXXXXXXXX":                         { EN: "e.g. 01XXXXXXXXX",                         BN: "যেমন: ০১XXXXXXXXX" },

  // ── Supplier ──────────────────────────────────────────────────────────────
  "Search by name, contact or address…":      { EN: "Search by name, contact or address…",      BN: "নাম, যোগাযোগ বা ঠিকানা দিয়ে অনুসন্ধান করুন…" },
  "Supplier Name":                            { EN: "Supplier Name",                            BN: "সরবরাহকারীর নাম" },
  "No suppliers found for":                  { EN: "No suppliers found for",                   BN: "কোনো সরবরাহকারী পাওয়া যায়নি" },
  "No suppliers added yet.":                 { EN: "No suppliers added yet.",                  BN: "এখনো কোনো সরবরাহকারী যোগ করা হয়নি।" },
  "suppliers":                                { EN: "suppliers",                                BN: "সরবরাহকারী" },
  "Add Supplier":                             { EN: "Add Supplier",                             BN: "সরবরাহকারী যোগ করুন" },
  "Supplier Name *":                          { EN: "Supplier Name *",                          BN: "সরবরাহকারীর নাম *" },
  "e.g. Acme Supplies Ltd.":                  { EN: "e.g. Acme Supplies Ltd.",                  BN: "যেমন: একমি সাপ্লাইজ লিমিটেড" },

  // ── Customer ──────────────────────────────────────────────────────────────
  "Customer Name":                            { EN: "Customer Name",                            BN: "গ্রাহকের নাম" },
  "Desk":                                     { EN: "Desk",                                     BN: "ডেস্ক" },
  "No customers found for":                  { EN: "No customers found for",                   BN: "কোনো গ্রাহক পাওয়া যায়নি" },
  "No customers added yet.":                 { EN: "No customers added yet.",                  BN: "এখনো কোনো গ্রাহক যোগ করা হয়নি।" },
  "customers":                                { EN: "customers",                                BN: "গ্রাহক" },
  "Add Customer":                             { EN: "Add Customer",                             BN: "গ্রাহক যোগ করুন" },
  "Customer Name *":                          { EN: "Customer Name *",                          BN: "গ্রাহকের নাম *" },
  "e.g. John Smith":                          { EN: "e.g. John Smith",                          BN: "যেমন: জন স্মিথ" },
  "Desk Name":                                { EN: "Desk Name",                                BN: "ডেস্কের নাম" },
  "e.g. Front Desk":                          { EN: "e.g. Front Desk",                          BN: "যেমন: ফ্রন্ট ডেস্ক" },
  "Desk Location":                            { EN: "Desk Location",                            BN: "ডেস্কের অবস্থান" },
  "e.g. Ground Floor":                        { EN: "e.g. Ground Floor",                        BN: "যেমন: গ্রাউন্ড ফ্লোর" },
  "Customer *":                               { EN: "Customer *",                               BN: "গ্রাহক *" },
  "-- Select Customer --":                    { EN: "-- Select Customer --",                    BN: "-- গ্রাহক নির্বাচন করুন --" },

  // ── Office ────────────────────────────────────────────────────────────────
  "Activity":                                 { EN: "Activity",                                 BN: "কার্যকলাপ" },
  "Order No.":                                { EN: "Order No.",                                BN: "ক্রম নম্বর" },
  "No offices found for":                    { EN: "No offices found for",                     BN: "কোনো অফিস পাওয়া যায়নি" },
  "No offices added yet.":                   { EN: "No offices added yet.",                    BN: "এখনো কোনো অফিস যোগ করা হয়নি।" },
  "Add Office":                               { EN: "Add Office",                               BN: "অফিস যোগ করুন" },
  "e.g. Mirpur Office":                       { EN: "e.g. Mirpur Office",                       BN: "যেমন: মিরপুর অফিস" },

  // ── Product Opening Balance ───────────────────────────────────────────────
  "Opening Quantity":                         { EN: "Opening Quantity",                         BN: "প্রারম্ভিক পরিমাণ" },
  "Posted successfully.":                     { EN: "Posted successfully.",                     BN: "সফলভাবে পোস্ট করা হয়েছে।" },
  "Posting":                                  { EN: "Posting",                                  BN: "পোস্ট করা হচ্ছে" },
  "Posting…":                                 { EN: "Posting…",                                 BN: "পোস্ট করা হচ্ছে…" },

  // ── Stock Register (Purchase Entry) ──────────────────────────────────────
  "Stock Purchase Entry":                     { EN: "Stock Purchase Entry",                     BN: "স্টক ক্রয় এন্ট্রি" },
  "Record incoming stock purchases":          { EN: "Record incoming stock purchases",          BN: "আগত স্টক ক্রয় রেকর্ড করুন" },
  "Supplier *":                               { EN: "Supplier *",                               BN: "সরবরাহকারী *" },
  "-- Select Supplier --":                    { EN: "-- Select Supplier --",                    BN: "-- সরবরাহকারী নির্বাচন করুন --" },
  "Pur. Rate":                                { EN: "Pur. Rate",                                BN: "ক্রয় মূল্য" },
  "Sales Rate":                               { EN: "Sales Rate",                               BN: "বিক্রয় মূল্য" },
  "Select a supplier in the head section.":   { EN: "Select a supplier in the head section.",   BN: "হেড সেকশনে সরবরাহকারী নির্বাচন করুন।" },
  "Failed to create purchase head.":          { EN: "Failed to create purchase head.",          BN: "ক্রয় হেড তৈরি করতে ব্যর্থ হয়েছে।" },

  // ── Distribution ──────────────────────────────────────────────────────────
  "Receiver Distribution":                    { EN: "Receiver Distribution",                    BN: "প্রাপক বিতরণ" },
  "Record items to distribute to receiver":   { EN: "Record items to distribute to receiver",   BN: "প্রাপকের কাছে বিতরণ করার আইটেম রেকর্ড করুন" },
  "Select a customer in the head section.":   { EN: "Select a customer in the head section.",   BN: "হেড সেকশনে গ্রাহক নির্বাচন করুন।" },
  "Failed to create return head.":            { EN: "Failed to create return head.",            BN: "রিটার্ন হেড তৈরি করতে ব্যর্থ হয়েছে।" },

  // ── Purchase Returns ──────────────────────────────────────────────────────
  "Record items returned to supplier":        { EN: "Record items returned to supplier",        BN: "সরবরাহকারীর কাছে ফেরত দেওয়া আইটেম রেকর্ড করুন" },

  // ── Sales Returns ─────────────────────────────────────────────────────────
  "Record items returned by customer":        { EN: "Record items returned by customer",        BN: "গ্রাহকের দ্বারা ফেরত দেওয়া আইটেম রেকর্ড করুন" },

  // ── Damage ────────────────────────────────────────────────────────────────
  "Record damaged items":                     { EN: "Record damaged items",                     BN: "ক্ষতিগ্রস্ত আইটেম রেকর্ড করুন" },
  "Failed to create damage head.":            { EN: "Failed to create damage head.",            BN: "ক্ষতির হেড তৈরি করতে ব্যর্থ হয়েছে।" },
  "No items yet. Fill in the form above and press + to add.": {
    EN: "No items yet. Fill in the form above and press + to add.",
    BN: "এখনো কোনো আইটেম নেই। উপরের ফর্ম পূরণ করুন এবং + চাপুন।",
  },
  "Damage Head ID:":                          { EN: "Damage Head ID:",                          BN: "ক্ষতির হেড আইডি:" },
};

// ─── Translation Helper ───────────────────────────────────────────────────────
// Usage in any component:
//   import { t } from "../i18n/translations";
//   <button>{t("Save Changes")}</button>
//
// If a key is missing from the map the original English string is returned so
// the UI never breaks.
export function t(key) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[DEFAULT_LANGUAGE] ?? entry["EN"] ?? key;
}
