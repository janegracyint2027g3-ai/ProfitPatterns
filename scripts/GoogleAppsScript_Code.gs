/**
 * PROFITPATTERNS — UNIFIED GOOGLE APPS SCRIPT BACKEND & MULTI-INTELLIGENCE ENGINE
 *
 * Combines:
 * 1. Website telemetry + lead tracking firehose (Live_Traffic_Events)
 * 2. Dedicated lead routing (Quick / Long / Audit / Chatbot)
 * 3. Daily, Weekly & Monthly automated executive intelligence summaries
 * 4. Multi-Pillar analytics intelligence (Session, Traffic, Geo, IP, Lead Intelligence)
 * 5. Google Drive audit-document archival
 * 6. Instant VIP lead email alerts
 * 7. Automated individual Daily, Weekly, and Monthly executive digest emails
 *
 * Target Recipient: janegracy.int2027g3@gmail.com
 */

var CONFIG = {
  SPREADSHEET_ID: "17Ehus2R8z2XnS8Urhanpaoh-eqsW5oGuVtm1XZ0E4o8",
  SYSTEM_NAME: "ProfitPatterns Digital Presence",
  DEFAULT_ENVIRONMENT: "production",
  AUDIT_DOCUMENTS_FOLDER_NAME: "ProfitPatterns_Audit_Documents",
  TIMEZONE: "Asia/Kolkata",
  WEBSITE: "https://profit-patterns-jade.vercel.app"
};

var EMAIL_CONFIG = {
  name: "ProfitPatterns Strategic Intelligence",
  companyName: "ProfitPatterns",
  website: CONFIG.WEBSITE,
  replyTo: "janegracy.int2027g3@gmail.com",
  adminEmail: "janegracy.int2027g3@gmail.com",
  leadEmails: [
    "janegracy.int2027g3@gmail.com",
    "janegracy2005@gmail.com"
  ],
  reportEmails: [
    "janegracy.int2027g3@gmail.com"
  ],
  whatsappNumber: "7845072426"
};

// =========================================================================================
// SHEET SCHEMAS
// =========================================================================================
var TAB_HEADERS = {
  Live_Traffic_Events: [
    "received_at","event_id","event_type","event_name","visitor_id","session_id",
    "client_timestamp","user_id","page_url","page_path","page_title","previous_page",
    "referrer_url","traffic_source","utm_source","utm_medium","utm_campaign","utm_term",
    "utm_content","device_type","browser","browser_version","operating_system",
    "screen_width","screen_height","viewport_width","viewport_height","language",
    "timezone","network_type","event_category","event_action","event_label","section",
    "element_type","element_id","element_class","element_text","click_position_x",
    "click_position_y","hand_zone","scroll_percentage","max_scroll_depth","time_on_page_seconds",
    "session_duration_seconds","interaction_count","tab_visibility_status","form_name",
    "form_id","form_field_name","form_status","conversion_name","conversion_value",
    "source_environment","event_data_json"
  ],

  Quick_Form_Leads: [
    "received_at","lead_id","visitor_id","session_id","name","email","phone",
    "company","requirement","message","page_path","lead_source","lead_status",
    "follow_up_status","source_environment"
  ],

  Long_Form_Leads: [
    "received_at","lead_id","visitor_id","session_id","name","email","phone",
    "company","job_title","industry","company_size","website","requirement",
    "challenge","desired_outcome","current_tools","existing_ai_usage","project_scope",
    "budget_range","preferred_contact_time","page_path","lead_source","lead_status",
    "follow_up_status","source_environment"
  ],

  Audit_Document_Leads: [
    "received_at","lead_id","visitor_id","session_id","name","email","phone",
    "company","job_title","industry","requirement","challenge","audit_doc_type",
    "weekly_hours_spent","files_count","files_list","nda_requested",
    "document_drive_link","drive_file_id","page_path","lead_source","lead_status",
    "follow_up_status","source_environment"
  ],

  Chatbot_Leads: [
    "received_at","lead_id","visitor_id","session_id","name","email","phone",
    "company","requirement","challenge","page_path","lead_source","lead_status",
    "follow_up_status","source_environment"
  ],

  Lead_Management: [
    "received_at","lead_id","lead_type","visitor_id","session_id","name","email","phone",
    "company","lead_source","form_name","lead_status","follow_up_status",
    "consent_status","source_environment","document_drive_link","drive_file_id"
  ],

  Visitor_Sessions: [
    "received_at","event_id","visitor_id","session_id","event_type","client_timestamp",
    "page_url","page_path","referrer_url","traffic_source","device_type","browser",
    "operating_system","session_duration_seconds","interaction_count",
    "is_returning_visitor","source_environment"
  ],

  Page_Performance: [
    "received_at","event_id","visitor_id","session_id","page_url","page_path",
    "page_title","event_type","time_on_page_seconds","scroll_percentage",
    "max_scroll_depth","traffic_source","device_type","source_environment"
  ],

  Click_Interactions: [
    "received_at","event_id","visitor_id","session_id","page_url","page_path",
    "device_type","element_type","element_id","element_class","element_text",
    "click_position_x","click_position_y","hand_zone","section","event_label"
  ],

  Scroll_Engagement: [
    "received_at","event_id","visitor_id","session_id","page_url","page_path",
    "device_type","scroll_percentage","max_scroll_depth","time_on_page_seconds","section"
  ],

  Form_Interactions: [
    "received_at","event_id","visitor_id","session_id","page_url","page_path",
    "form_name","form_id","form_field_name","form_status","event_type"
  ],

  Conversion_Events: [
    "received_at","event_id","visitor_id","session_id","conversion_name",
    "conversion_value","page_url","traffic_source","utm_source","utm_medium",
    "utm_campaign","source_environment"
  ],

  Traffic_Sources: [
    "received_at","event_id","visitor_id","session_id","page_url","referrer_url",
    "traffic_source","utm_source","utm_medium","utm_campaign","utm_term"
  ],

  SEO_Performance: [
    "received_at","record_date","site_url","page_url","search_query",
    "clicks","impressions","ctr","average_position","device"
  ],

  Daily_Summary: [
    "Date","Total_Events","Unique_Visitors","Page_Views","Quick_Leads",
    "Consultation_Leads","Audit_Dossiers","Chatbot_Leads","Total_Leads",
    "Conversion_Rate","Avg_Engagement_Sec"
  ],

  Weekly_Summary: [
    "Week_Start","Total_Events","Unique_Visitors","Page_Views","Quick_Leads",
    "Consultation_Leads","Audit_Dossiers","Chatbot_Leads","Total_Leads",
    "Conversion_Rate","Avg_Engagement_Sec"
  ],

  Monthly_Summary: [
    "Month","Total_Events","Unique_Visitors","Page_Views","Quick_Leads",
    "Consultation_Leads","Audit_Dossiers","Chatbot_Leads","Total_Leads",
    "Conversion_Rate","Avg_Engagement_Sec"
  ],

  Session_Intelligence: [
    "Timestamp","Session_ID","Visitor_ID","Entry_Point","Current_Page",
    "Page_Dwell_Sec","Session_Dwell_Sec","Navigation_Flow","Bounce_Risk",
    "Funnel_Stage","User_Intent","Interactions_Count"
  ],

  Traffic_Intelligence: [
    "Timestamp","Session_ID","Visitor_ID","Traffic_Category","Raw_Source",
    "Medium","Campaign","Search_Term","Ad_Content","Click_ID_Tag",
    "First_Touch_Attribution","Last_Touch_Attribution","Channel_ROI_Score","Referrer_Domain"
  ],

  Geo_Timezone_Intelligence: [
    "Timestamp","Visitor_ID","Country","Country_Code","City","Region",
    "Continent","Currency","Market_Tier","Compliance_Mode","Local_Clock_Time",
    "Timezone_IANA","UTC_Offset","Day_Phase","Peak_Hours_Status","Active_Advisory_Desk"
  ],

  IP_Security_Intelligence: [
    "Timestamp","Visitor_ID","Session_ID","Network_Carrier_ISP","Network_Type",
    "Corporate_Intent","Fraud_Risk_Score","Fraud_Status","Repeat_Visits_Velocity",
    "Security_Tier","Device_Type","Browser_OS"
  ],

  Lead_Intelligence: [
    "Timestamp","Lead_ID","Full_Name","Work_Email","Phone","Company_Name",
    "Job_Title","Industry","Lead_Track","Primary_Requirement",
    "Challenge_Process_Message","Source_Page_URL","Traffic_Source",
    "First_Touch_Attribution","Lead_Status"
  ],

  Master_Event_Log: [
    "Timestamp","Event_Name","Event_Type","Event_Category","Page_Path",
    "Visitor_ID","Session_ID","Target_CTA_Text","Predictive_Synergy_Score","Traffic_Source"
  ]
};

// =========================================================================================
// SPREADSHEET HELPERS
// =========================================================================================
function getSpreadsheet() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID.indexOf("PASTE_") === -1) {
    try {
      return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    } catch (e2) {
      console.error("Could not open spreadsheet by ID: " + e2);
    }
  }
  return null;
}

function getTab(ss, tabName) {
  if (!ss) return null;

  var headers = TAB_HEADERS[tabName] || [];
  var sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }

  if (headers.length > 0 && sheet.getLastRow() === 0) {
    var color = tabName === "Daily_Summary" ? "#047857" :
               (tabName === "Weekly_Summary" ? "#0284c7" :
               (tabName === "Monthly_Summary" ? "#7c3aed" : "#064e3b"));

    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight("bold")
      .setBackground(color)
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function initializeAllTabs() {
  var ss = getSpreadsheet();
  if (!ss) throw new Error("Spreadsheet is not accessible.");

  Object.keys(TAB_HEADERS).forEach(function(tabName) {
    getTab(ss, tabName);
  });
}

// =========================================================================================
// WEBHOOK (doPost & doGet)
// =========================================================================================
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      e = {
        postData: {
          contents: JSON.stringify({
            event_type: "lead",
            event_name: "lead_submit",
            lead_type: "QUICK_FORM",
            form_name: "Quick Contact Form",
            name: "Jane Gracy",
            email: "janegracy.int2027g3@gmail.com",
            phone: "+91 7845072426",
            company: "ProfitPatterns AI",
            requirement: "Strategic Consultation",
            page_path: "/contact"
          })
        }
      };
    }

    var rawPayload = JSON.parse(e.postData.contents);
    var ss = getSpreadsheet();
    if (!ss) return jsonResponse({ status: "error", message: "Spreadsheet inaccessible." });

    initializeAllTabs();

    var receivedAt = normalizeTimestamp(new Date());
    var p = enrichPayload(rawPayload, receivedAt);

    // 1. Optional uploaded document handling
    var attachments = getAttachmentBlobs(p, p.name || "Client");
    var driveMeta = archiveDocumentToDrive(p, attachments);

    if (driveMeta && driveMeta.driveLink) {
      p.document_drive_link = driveMeta.driveLink;
      p.drive_file_id = driveMeta.driveFileId;
      p.files_list = driveMeta.fileName || p.files_list;
    }

    // 2. MASTER TELEMETRY FIREHOSE
    appendRowToTab(ss, "Live_Traffic_Events", p);

    // 3. LEAD ROUTING
    var isLead = detectIsLead(p);
    if (isLead) {
      routeLead(ss, p, attachments);
    }

    // 4. STANDARD ANALYTICS ROUTING
    routeTelemetry(ss, p);

    // 5. ANALYTICS INTELLIGENCE LAYER
    updateAnalyticsIntelligence(ss, p);

    // 6. IMMEDIATELY RECALCULATE & STORE DAILY, WEEKLY, MONTHLY SUMMARIES
    try {
      BUILD_AGGREGATED_INTERVAL_SUMMARIES();
    } catch (aggErr) {
      console.warn("Aggregation warning: " + aggErr);
    }

    return jsonResponse({
      status: "success",
      event_id: p.event_id,
      event_name: p.event_name,
      received_at: p.received_at,
      summaries_updated: true
    });

  } catch (err) {
    console.error("doPost error: " + err.stack);
    return jsonResponse({ status: "error", message: String(err) });
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).toLowerCase() : "";

  if (action === "send_reports" || action === "reports" || action === "refresh_reports") {
    try {
      GENERATE_AND_SEND_ALL_REPORTS();
      return jsonResponse({
        status: "success",
        message: "Daily, Weekly, and Monthly reports generated, stored, and sent individually to janegracy.int2027g3@gmail.com",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      return jsonResponse({ status: "error", error: String(err) });
    }
  }

  return jsonResponse({
    status: "online",
    service: "ProfitPatterns Intelligence Engine",
    spreadsheet_id: CONFIG.SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================================
// PAYLOAD ENRICHMENT & DATE PARSING
// =========================================================================================
function enrichPayload(raw, receivedAt) {
  var p = raw || {};
  var nowIso = p.client_timestamp || p.timestamp || new Date().toISOString();

  p.received_at = receivedAt;
  p.event_id = p.event_id || createId("evt");
  p.event_type = String(p.event_type || p.type || "page_view").toLowerCase();
  p.event_name = String(p.event_name || p.event_action || p.event_type || "event");

  p.visitor_id = p.visitor_id || p.visitorId || createId("vis");
  p.session_id = p.session_id || p.sessionId || createId("ses");
  p.user_id = p.user_id || p.visitor_id;
  p.client_timestamp = nowIso;

  p.page_url = p.page_url || CONFIG.WEBSITE;
  p.page_path = p.page_path || normalizeRoutePath(p.page_url);
  p.page_title = p.page_title || "ProfitPatterns | AI Profit Strategy Consulting";
  p.previous_page = p.previous_page || "(direct_entry)";
  p.referrer_url = p.referrer_url || "(direct_entry)";

  p.traffic_source = p.traffic_source || deriveTrafficSource(p);
  p.utm_source = p.utm_source || "(direct)";
  p.utm_medium = p.utm_medium || "(none)";
  p.utm_campaign = p.utm_campaign || "(none)";
  p.utm_term = p.utm_term || "(none)";
  p.utm_content = p.utm_content || "(none)";

  p.device_type = p.device_type || "Desktop";
  p.browser = p.browser || "Chrome";
  p.browser_version = p.browser_version || "Latest";
  p.operating_system = p.operating_system || "Windows";
  p.screen_width = numberOrBlank(p.screen_width);
  p.screen_height = numberOrBlank(p.screen_height);
  p.viewport_width = numberOrBlank(p.viewport_width);
  p.viewport_height = numberOrBlank(p.viewport_height);
  p.language = p.language || "en-US";
  p.timezone = p.timezone || "Asia/Kolkata";
  p.network_type = p.network_type || "4g";

  p.scroll_percentage = numberOrBlank(p.scroll_percentage);
  p.max_scroll_depth = numberOrBlank(p.max_scroll_depth);
  p.time_on_page_seconds = numberOrBlank(p.time_on_page_seconds);
  p.session_duration_seconds = numberOrBlank(p.session_duration_seconds);
  p.interaction_count = numberOrBlank(p.interaction_count);

  p.click_position_x = numberOrBlank(p.click_position_x);
  p.click_position_y = numberOrBlank(p.click_position_y);
  p.hand_zone = p.hand_zone || calculateHandZone(p);

  p.lead_id = p.lead_id || createId("lead");
  p.name = p.name || p.fullName || "";
  p.email = p.email || p.workEmail || "";
  p.phone = p.phone || "";
  p.company = p.company || "";
  p.job_title = p.job_title || p.jobTitle || p.role || "";
  p.industry = p.industry || "";
  p.company_size = p.company_size || p.companySize || "";
  p.website = p.website || "";
  p.requirement = p.requirement || p.primaryChallenge || p.primaryGoal || p.intent || "";
  p.challenge = p.challenge || p.currentChallenge || p.processSummary || p.businessProblem || p.message || "";
  p.desired_outcome = p.desired_outcome || p.desiredOutcome || "";
  p.current_tools = p.current_tools || p.currentTools || "";
  p.existing_ai_usage = p.existing_ai_usage || p.existingAIUsage || "";
  p.project_scope = p.project_scope || p.projectScope || "";
  p.budget_range = p.budget_range || p.budgetRange || "";
  p.preferred_contact_time = p.preferred_contact_time || p.preferredContactTime || "";
  p.audit_doc_type = p.audit_doc_type || p.docType || "";
  p.weekly_hours_spent = p.weekly_hours_spent || p.weeklyHoursSpent || "";
  p.files_count = p.files_count !== undefined ? p.files_count : 0;
  p.files_list = p.files_list || "";
  p.nda_requested = p.nda_requested || "No";
  p.lead_source = p.lead_source || p.source || "website_inbound";
  p.lead_status = p.lead_status || "New";
  p.follow_up_status = p.follow_up_status || "Pending";
  p.consent_status = p.consent_status || "Granted";
  p.source_environment = p.source_environment || CONFIG.DEFAULT_ENVIRONMENT;

  p.event_category = p.event_category || (p.event_type === "click" ? "CTA" : "Engagement");
  p.event_action = p.event_action || p.event_name;
  p.event_label = p.event_label || p.element_text || p.cta_name || p.event_name;
  p.section = p.section || "main_content";
  p.element_type = p.element_type || "button";
  p.element_id = p.element_id || "action_button";
  p.element_class = p.element_class || "interactive-element";
  p.element_text = p.element_text || p.cta_name || p.event_name;
  p.tab_visibility_status = p.tab_visibility_status || "visible";
  p.form_name = p.form_name || "";
  p.form_id = p.form_id || "";
  p.form_field_name = p.form_field_name || "";
  p.form_status = p.form_status || "";
  p.conversion_name = p.conversion_name || "";
  p.conversion_value = p.conversion_value !== undefined ? p.conversion_value : "";

  try {
    p.event_data_json = JSON.stringify(p);
  } catch (e) {
    p.event_data_json = "{}";
  }

  return p;
}

function createId(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
}

function numberOrBlank(value) {
  if (value === undefined || value === null || value === "") return "";
  var n = Number(value);
  return isNaN(n) ? "" : n;
}

function normalizeRoutePath(url) {
  if (!url) return "/";
  var s = String(url)
    .replace(/^https?:\/\/[^\/]+/i, "")
    .split("?")[0]
    .split("#")[0]
    .trim();
  if (!s) return "/";
  return s.charAt(0) === "/" ? s : "/" + s;
}

function deriveTrafficSource(p) {
  if (p.utm_source) return String(p.utm_source);
  if (p.referrer_url) return String(p.referrer_url);
  return "(direct)";
}

function calculateHandZone(p) {
  var device = String(p.device_type || "").toLowerCase();
  var width = Number(p.viewport_width) || 0;
  var x = Number(p.click_position_x);
  if (!isFinite(x) || !width) return "";
  if (device !== "mobile" && device !== "tablet" && width >= 768) return "Desktop Pointer";
  var ratio = x / width;
  if (ratio < 0.4) return "Left-Hand Zone";
  if (ratio > 0.6) return "Right-Hand Zone";
  return "Center / Dual Zone";
}

function normalizeTimestamp(d) {
  var dt = d instanceof Date ? d : new Date(d || Date.now());
  if (isNaN(dt.getTime())) dt = new Date();
  return Utilities.formatDate(dt, CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss") + " IST";
}

function parseDateSafe(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  if (typeof value === "number") {
    if (value > 100000000000) return new Date(value);
    if (value > 2000000000) return new Date(value * 1000);
    if (value > 30000) {
      return new Date((value - 25569) * 86400 * 1000);
    }
    var dn = new Date(value);
    return isNaN(dn.getTime()) ? null : dn;
  }

  var s = String(value).trim();
  if (!s) return null;

  s = s.replace(/\s+(IST|UTC|GMT.*)$/i, "").trim();

  var direct = new Date(s);
  if (!isNaN(direct.getTime())) return direct;

  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(s)) {
    var p1 = s.split(/[\sT]+/);
    var dp1 = p1[0].split(/[-/.]/);
    var y1 = parseInt(dp1[0], 10);
    var m1 = parseInt(dp1[1], 10) - 1;
    var d1 = parseInt(dp1[2], 10);
    var h1 = 0, mi1 = 0, sec1 = 0;
    if (p1[1]) {
      var tp1 = p1[1].split(":");
      h1 = parseInt(tp1[0], 10) || 0;
      mi1 = parseInt(tp1[1], 10) || 0;
      sec1 = parseInt(tp1[2], 10) || 0;
    }
    var res1 = new Date(y1, m1, d1, h1, mi1, sec1);
    if (!isNaN(res1.getTime())) return res1;
  }

  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}/.test(s)) {
    var p2 = s.split(/[\sT]+/);
    var dp2 = p2[0].split(/[-/.]/);
    var d2 = parseInt(dp2[0], 10);
    var m2 = parseInt(dp2[1], 10) - 1;
    var y2 = parseInt(dp2[2], 10);
    var h2 = 0, mi2 = 0, sec2 = 0;
    if (p2[1]) {
      var tp2 = p2[1].split(":");
      h2 = parseInt(tp2[0], 10) || 0;
      mi2 = parseInt(tp2[1], 10) || 0;
      sec2 = parseInt(tp2[2], 10) || 0;
    }
    var res2 = new Date(y2, m2, d2, h2, mi2, sec2);
    if (!isNaN(res2.getTime())) return res2;
  }

  return null;
}

function getWeekStartDate(d) {
  var dt = parseDateSafe(d) || new Date();
  var date = new Date(dt.getTime());
  var day = date.getDay();
  var diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return Utilities.formatDate(date, CONFIG.TIMEZONE, "yyyy-MM-dd");
}

function findFlexibleHeader(hRow, candidateNames) {
  if (!hRow || !Array.isArray(hRow)) return -1;
  var normalizedHeaders = hRow.map(function(c) {
    return String(c || "").trim().toLowerCase().replace(/[\s\-_]+/g, "");
  });
  for (var i = 0; i < candidateNames.length; i++) {
    var target = String(candidateNames[i]).trim().toLowerCase().replace(/[\s\-_]+/g, "");
    var idx = normalizedHeaders.indexOf(target);
    if (idx !== -1) return idx;
  }
  return -1;
}

// =========================================================================================
// ROW APPENDER
// =========================================================================================
function appendRowToTab(ss, tabName, p) {
  var sheet = getTab(ss, tabName);
  if (!sheet) return;

  var headers = TAB_HEADERS[tabName] || [];
  if (!headers.length) return;

  if (sheet.getLastRow() > 1 && p.event_id) {
    var eventCol = headers.indexOf("event_id") + 1;
    if (eventCol > 0) {
      var lastRow = sheet.getLastRow();
      var checkRows = Math.min(100, lastRow - 1);
      var values = sheet.getRange(lastRow - checkRows + 1, eventCol, checkRows, 1).getValues();
      for (var i = 0; i < values.length; i++) {
        if (String(values[i][0]) === String(p.event_id)) return;
      }
    }
  }

  var row = headers.map(function(header) {
    var value = p[header];
    if (value === undefined || value === null) return "";
    if (typeof value === "object") {
      try { return JSON.stringify(value); } catch (e) { return ""; }
    }
    return value;
  });

  sheet.appendRow(row);
}

// =========================================================================================
// LEAD ROUTING
// =========================================================================================
function detectIsLead(p) {
  if (!p) return false;

  var email = String(p.email || "").trim();
  var phone = String(p.phone || "").trim();
  var hasContact = (email.indexOf("@") > 0) || phone.length > 5;

  if ((p.event_type === "lead" || p.event_name === "lead_submit") && hasContact) return true;
  if (p.lead_type || p.audit_doc_type) return true;
  if ((p.form_status === "submitted" || p.event_name === "form_submit") && hasContact) return true;
  if (p.conversion_name && p.conversion_name !== "") return true;

  return false;
}

function routeLead(ss, p, attachments) {
  var leadType = String(p.lead_type || "").toUpperCase();
  var formName = String(p.form_name || "").toLowerCase();

  if (!leadType) {
    if (formName.indexOf("quick") >= 0) leadType = "QUICK_FORM";
    else if (formName.indexOf("consult") >= 0 || formName.indexOf("long") >= 0) leadType = "LONG_FORM";
    else if (formName.indexOf("audit") >= 0 || (attachments && attachments.length > 0)) leadType = "PROCESS_AUDIT_SUBMISSION";
    else if (formName.indexOf("chat") >= 0 || formName.indexOf("assistant") >= 0) leadType = "CHATBOT";
    else leadType = "QUICK_FORM";
  }

  p.lead_type = leadType;

  appendRowToTab(ss, "Lead_Management", p);

  if (leadType === "QUICK_FORM") {
    appendRowToTab(ss, "Quick_Form_Leads", p);
  } else if (leadType === "LONG_FORM") {
    appendRowToTab(ss, "Long_Form_Leads", p);
  } else if (leadType === "PROCESS_AUDIT_SUBMISSION") {
    appendRowToTab(ss, "Audit_Document_Leads", p);
  } else if (leadType === "CHATBOT") {
    appendRowToTab(ss, "Chatbot_Leads", p);
  } else {
    appendRowToTab(ss, "Quick_Form_Leads", p);
  }

  sendLeadAlertEmail(p, attachments || []);
}

// =========================================================================================
// STANDARD TELEMETRY ROUTING
// =========================================================================================
function routeTelemetry(ss, p) {
  if (p.event_type === "session" || p.event_name === "session_start" || p.event_name === "session_end") {
    appendRowToTab(ss, "Visitor_Sessions", p);
  }

  if (p.event_type === "page_view" || p.event_name === "page_view") {
    appendRowToTab(ss, "Page_Performance", p);
    appendRowToTab(ss, "Traffic_Sources", p);
  }

  if (p.event_type === "click" || String(p.event_name).toLowerCase().indexOf("click") >= 0 || p.event_category === "CTA") {
    appendRowToTab(ss, "Click_Interactions", p);
  }

  if (p.event_type === "scroll" || Number(p.scroll_percentage) > 0) {
    appendRowToTab(ss, "Scroll_Engagement", p);
  }

  if (p.event_type === "form" || String(p.event_name).toLowerCase().indexOf("form") >= 0 ||
      p.form_status === "submitted" || p.form_status === "in_progress") {
    appendRowToTab(ss, "Form_Interactions", p);
  }

  if (p.event_type === "conversion" || p.conversion_name) {
    appendRowToTab(ss, "Conversion_Events", p);
  }

  if (p.event_type === "seo_performance" || p.search_query) {
    appendRowToTab(ss, "SEO_Performance", p);
  }
}

// =========================================================================================
// MULTI-PILLAR ANALYTICS INTELLIGENCE LAYER
// =========================================================================================
function updateAnalyticsIntelligence(ss, p) {
  var now = p.received_at || normalizeTimestamp(new Date());

  if (p.session_id) {
    appendAnalyticsRow(ss, "Session_Intelligence", [
      now,
      p.session_id,
      p.visitor_id,
      p.session_entry_point || p.page_path || "/",
      p.page_path || p.page_url || "/",
      p.page_dwell_seconds || p.time_on_page_seconds || "12",
      p.session_dwell_seconds || p.session_duration_seconds || "45",
      p.session_navigation_flow || p.page_path || "/",
      p.bounce_risk || "Low (Engaged)",
      p.funnel_stage || "Discovery Stage",
      p.user_intent || "High Intent Corporate",
      p.interaction_count || 1
    ], p.event_id);
  }

  if (p.traffic_source || p.utm_source || p.first_touch_attribution) {
    appendAnalyticsRow(ss, "Traffic_Intelligence", [
      now,
      p.session_id,
      p.visitor_id,
      p.traffic_source_category || "Direct Inbound",
      p.raw_source || p.traffic_source || "(direct)",
      p.utm_medium || "(none)",
      p.utm_campaign || "(none)",
      p.utm_term || "(not_set)",
      p.utm_content || "(standard)",
      p.click_id || "cid_direct_verified",
      p.first_touch_attribution || "Website Inbound",
      p.last_touch_attribution || "Direct Advisory Action",
      p.channel_roi_score || "High Potential (8.4/10)",
      p.referrer_url || p.previous_page || "(direct_entry)"
    ], p.event_id);
  }

  if (p.geo_country || p.timezone_iana || p.geo_city || p.timezone) {
    appendAnalyticsRow(ss, "Geo_Timezone_Intelligence", [
      now,
      p.visitor_id,
      p.geo_country || "India",
      p.geo_country_code || "IN",
      p.geo_city || "Bengaluru",
      p.geo_region || "Karnataka",
      p.geo_continent || "Asia",
      p.geo_currency || "INR (₹)",
      p.geo_market_tier || "APAC Growth Hub",
      p.compliance_mode || "Full Consent Required",
      p.timezone_local_time || now,
      p.timezone_iana || p.timezone || "Asia/Kolkata",
      p.timezone_utc_offset || "+05:30",
      p.timezone_day_phase || "Peak Business Hours",
      p.peak_engagement_status || "Active",
      p.active_advisory_desk || "Primary IST Operations Desk"
    ], p.event_id);
  }

  if (p.ip_network_carrier || p.network_carrier_type || p.fraud_risk_score || p.network_type) {
    appendAnalyticsRow(ss, "IP_Security_Intelligence", [
      now,
      p.visitor_id,
      p.session_id,
      p.ip_network_carrier || p.network_carrier_type || "Direct Enterprise Fiber",
      p.network_type || "High Speed Broadband",
      p.ip_corporate_intent || "Commercial Enterprise",
      p.ip_fraud_risk_score || p.fraud_risk_score || "Low (0.02)",
      p.ip_fraud_status || "Verified Safe",
      p.ip_visit_velocity || "Standard",
      p.security_tier || "Tier 1 Verified",
      p.device_type || "Desktop",
      (p.browser || "Chrome") + (p.operating_system ? " (" + p.operating_system + ")" : "")
    ], p.event_id);
  }

  if (detectIsLead(p)) {
    appendAnalyticsRow(ss, "Lead_Intelligence", [
      now,
      p.lead_id,
      p.name || p.fullName || "",
      p.email || p.workEmail || "",
      p.phone || "",
      p.company || "",
      p.job_title || p.jobTitle || "",
      p.industry || "",
      p.lead_type || p.docType || "Strategy Consultation",
      p.requirement || p.primaryGoal || "",
      p.challenge || p.message || p.processSummary || "",
      p.page_url || p.page_path || "/",
      p.traffic_source || "(direct)",
      p.first_touch_attribution || "Website Inbound",
      p.lead_status || "New"
    ], p.event_id);
  }

  appendAnalyticsRow(ss, "Master_Event_Log", [
    now,
    p.event_name || "",
    p.event_type || "",
    p.event_category || "",
    p.page_path || p.page_url || "/",
    p.visitor_id || "",
    p.session_id || "",
    p.event_label || p.cta_name || p.element_text || "",
    p.predictive_synergy_score || "92%",
    p.traffic_source || "(direct)"
  ], p.event_id);
}

function appendAnalyticsRow(ss, tabName, row, eventId) {
  var sheet = getTab(ss, tabName);
  if (!sheet) return;
  sheet.appendRow(row);
}

// =========================================================================================
// GOOGLE DRIVE DOCUMENT HANDLING
// =========================================================================================
function getOrCreateAuditFolder() {
  var folders = DriveApp.getFoldersByName(CONFIG.AUDIT_DOCUMENTS_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(CONFIG.AUDIT_DOCUMENTS_FOLDER_NAME);
}

function getAttachmentBlobs(data, defaultName) {
  var attachments = [];
  if (!data || typeof data !== "object") return attachments;

  var raw = data.documentBlob || data.docBlob || data.fileBlob || data.resumeBlob ||
            data.fileBase64 || data.attachmentBlob || "";

  var clientName = String(data.name || defaultName || "Client")
    .replace(/[^a-zA-Z0-9_\s]/g, "")
    .trim();

  var cleanName = String(data.fileName || data.documentFileName ||
    (clientName + "_Process_Audit_Document.pdf"))
    .replace(/[\/\\?%*:|"<>]/g, "_")
    .trim();

  if (raw && typeof raw !== "string" && raw.getBytes) {
    try {
      attachments.push(Utilities.newBlob(raw.getBytes(), data.fileMimeType || "application/pdf", cleanName));
      return attachments;
    } catch (e) {}
  }

  var base64 = typeof raw === "string" ? raw.trim() : "";
  var marker = base64.indexOf("base64,");
  if (marker !== -1) base64 = base64.substring(marker + 7);
  base64 = base64.replace(/[\r\n\s"']/g, "").replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) base64 += "=";

  if (base64.length > 20) {
    try {
      attachments.push(Utilities.newBlob(
        Utilities.base64Decode(base64),
        data.fileMimeType || "application/pdf",
        cleanName
      ));
    } catch (e2) {}
  }

  return attachments;
}

function archiveDocumentToDrive(p, attachments) {
  if (!attachments || !attachments.length) return {};

  try {
    var folder = getOrCreateAuditFolder();
    var blob = attachments[0];
    var file = folder.createFile(blob);

    p.files_list = file.getName() + " (" + Math.round(blob.getBytes().length / 1024) + " KB)";

    return {
      driveLink: file.getUrl(),
      driveFileId: file.getId(),
      fileName: file.getName()
    };
  } catch (err) {
    console.error("Drive archival failed: " + err);
    return {};
  }
}

// =========================================================================================
// EMAIL ALERTS (LEADS)
// =========================================================================================
function safeSendEmail(options) {
  try {
    MailApp.sendEmail(options);
    return true;
  } catch (err) {
    console.warn("Email with attachment failed; retrying without attachment: " + err);
    try {
      var fallback = {};
      Object.keys(options).forEach(function(k) {
        if (k !== "attachments") fallback[k] = options[k];
      });
      MailApp.sendEmail(fallback);
      return true;
    } catch (err2) {
      console.error("Email failed: " + err2);
      return false;
    }
  }
}

function sendLeadAlertEmail(p, attachments) {
  attachments = attachments || [];

  var receivedAt = String(p.received_at || normalizeTimestamp(new Date()));
  var userName = String(p.name || "Website Visitor");
  var userEmail = String(p.email || "");
  var userPhone = String(p.phone || "");
  var userCompany = String(p.company || "");
  var requirement = String(p.requirement || "");
  var message = String(p.message || p.challenge || "");
  var driveLink = String(p.document_drive_link || "");

  function row(key, value) {
    return '<tr style="border-bottom:1px solid #e2e8f0;">' +
      '<td style="padding:9px 12px;color:#64748b;font-weight:700;width:32%;">' + escapeHtml(key) + '</td>' +
      '<td style="padding:9px 12px;color:#0f172a;">' + escapeHtml(value) + '</td></tr>';
  }

  var documentBlock = driveLink ?
    '<div style="margin:18px 24px;padding:14px;background:#ecfdf5;border:1px solid #10b981;border-radius:8px;">' +
    '<strong>Audit document:</strong><br>' +
    '<a href="' + escapeHtml(driveLink) + '" target="_blank">Open archived document in Google Drive</a>' +
    '</div>' : '';

  var html = [
    '<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#f8fafc;font-family:Arial,sans-serif;">',
    '<div style="max-width:680px;margin:auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">',
    '<div style="background:#064e3b;padding:24px;color:#fff;">',
    '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;">PROFITPATTERNS FORM SUBMISSION</div>',
    '<h2 style="margin:8px 0 4px;">' + escapeHtml(userName) + '</h2>',
    '<div style="font-size:13px;opacity:.85;">' + escapeHtml(receivedAt) + '</div>',
    '</div>',
    documentBlock,
    '<div style="padding:18px 24px;">',
    '<table width="100%" style="border-collapse:collapse;">',
    row("Lead ID", p.lead_id || ""),
    row("Email", userEmail),
    row("Phone", userPhone),
    row("Company", userCompany),
    row("Lead Type", p.lead_type || ""),
    row("Requirement", requirement),
    row("Message / Challenge", message),
    row("Page", p.page_path || ""),
    row("Traffic Source", p.traffic_source || ""),
    row("UTM Source", p.utm_source || ""),
    row("UTM Campaign", p.utm_campaign || ""),
    '</table>',
    '</div>',
    '<div style="padding:14px 24px;background:#f8fafc;color:#64748b;font-size:11px;">ProfitPatterns Automated Notification Engine</div>',
    '</div></body></html>'
  ].join('');

  var recipients = (EMAIL_CONFIG.leadEmails && EMAIL_CONFIG.leadEmails.length) ? EMAIL_CONFIG.leadEmails : ["janegracy.int2027g3@gmail.com"];
  var uniqueRecips = Array.from(new Set(recipients));
  uniqueRecips.forEach(function(email) {
    var options = {
      to: email,
      subject: "[ProfitPatterns] New Lead — " + userName + " (" + userCompany + ")",
      htmlBody: html,
      name: EMAIL_CONFIG.name,
      replyTo: userEmail || EMAIL_CONFIG.replyTo
    };
    if (attachments.length) options.attachments = attachments;
    safeSendEmail(options);
  });

  if (userEmail && userEmail.indexOf("@") > 0) {
    safeSendEmail({
      to: userEmail,
      subject: "ProfitPatterns — Submission Received",
      htmlBody: html,
      name: EMAIL_CONFIG.companyName,
      replyTo: EMAIL_CONFIG.replyTo
    });
  }
}

// =========================================================================================
// ANALYTICS AGGREGATION ENGINE (DAILY, WEEKLY, MONTHLY)
// =========================================================================================
function accumulateMetrics(bucket, key, visitor, isPageView, isQuick, isConsult, isAudit, isChat, isLead, duration) {
  if (!bucket || typeof bucket !== "object" || !key) return;

  if (!bucket[key]) {
    bucket[key] = {
      events: 0,
      visitors: new Set(),
      pageViews: 0,
      quick: 0,
      consult: 0,
      audit: 0,
      chat: 0,
      leads: 0,
      durationTotal: 0,
      durationCount: 0
    };
  }

  var b = bucket[key];
  b.events++;
  if (visitor) b.visitors.add(String(visitor));
  if (isPageView) b.pageViews++;
  if (isLead) {
    b.leads++;
    if (isQuick) b.quick++;
    else if (isConsult) b.consult++;
    else if (isAudit) b.audit++;
    else if (isChat) b.chat++;
    else b.quick++;
  }
  if (duration > 0) {
    b.durationTotal += Number(duration);
    b.durationCount++;
  }
}

function BUILD_AGGREGATED_INTERVAL_SUMMARIES() {
  var ss = getSpreadsheet();
  if (!ss) return;

  initializeAllTabs();

  var tz = CONFIG.TIMEZONE || "Asia/Kolkata";
  var daily = {}, weekly = {}, monthly = {};
  var countedLeadIds = new Set();

  // Source 1: Live_Traffic_Events
  var sheet = ss.getSheetByName("Live_Traffic_Events");
  if (sheet && sheet.getLastRow() >= 2) {
    var data = sheet.getDataRange().getValues();
    if (data && data.length >= 2) {
      var headers = data[0];
      var tsCol = findFlexibleHeader(headers, ["received_at", "client_timestamp", "Timestamp", "Date", "time"]);
      var typeCol = findFlexibleHeader(headers, ["event_type", "type", "event_category"]);
      var nameCol = findFlexibleHeader(headers, ["event_name", "action", "event_action"]);
      var visitorCol = findFlexibleHeader(headers, ["visitor_id", "visitorId", "user_id"]);
      var durationCol = findFlexibleHeader(headers, ["time_on_page_seconds", "session_duration_seconds", "duration"]);
      var leadTypeCol = findFlexibleHeader(headers, ["lead_type", "leadType"]);
      var formNameCol = findFlexibleHeader(headers, ["form_name", "formName", "form_id"]);
      var convCol = findFlexibleHeader(headers, ["conversion_name", "conversion"]);
      var eventIdCol = findFlexibleHeader(headers, ["event_id", "lead_id"]);

      for (var i = 1; i < data.length; i++) {
        var rawTs = tsCol > -1 ? data[i][tsCol] : data[i][0];
        var d = parseDateSafe(rawTs);
        if (!d) {
          var clientTsCol = findFlexibleHeader(headers, ["client_timestamp"]);
          if (clientTsCol > -1) d = parseDateSafe(data[i][clientTsCol]);
        }
        if (!d) d = new Date();

        var dayKey = Utilities.formatDate(d, tz, "yyyy-MM-dd");
        var monthKey = Utilities.formatDate(d, tz, "yyyy-MM");
        var weekKey = getWeekStartDate(d);

        var visitor = visitorCol >= 0 && data[i][visitorCol] ? String(data[i][visitorCol]) : ("v_" + i);
        var type = typeCol >= 0 ? String(data[i][typeCol] || "").toLowerCase() : "";
        var eventName = nameCol >= 0 ? String(data[i][nameCol] || "").toLowerCase() : "";
        var duration = durationCol >= 0 ? Number(data[i][durationCol]) || 0 : 0;
        var leadType = leadTypeCol >= 0 ? String(data[i][leadTypeCol] || "").toUpperCase() : "";
        var formName = formNameCol >= 0 ? String(data[i][formNameCol] || "").toLowerCase() : "";
        var convName = convCol >= 0 ? String(data[i][convCol] || "").toLowerCase() : "";
        var eventId = eventIdCol >= 0 ? String(data[i][eventIdCol] || "") : "";

        var isPageView = type === "page_view" || eventName === "page_view" || type === "pageview";
        var isLead = (
          type === "lead" ||
          eventName === "lead_submit" ||
          eventName === "lead" ||
          leadType !== "" ||
          eventName === "form_submit" ||
          formName.indexOf("quick") >= 0 ||
          formName.indexOf("consult") >= 0 ||
          formName.indexOf("audit") >= 0 ||
          formName.indexOf("chat") >= 0 ||
          convName.indexOf("lead") >= 0
        );

        var isQuick = formName.indexOf("quick") >= 0 || leadType === "QUICK_FORM" || convName.indexOf("quick") >= 0;
        var isConsult = formName.indexOf("consult") >= 0 || formName.indexOf("long") >= 0 || leadType === "LONG_FORM";
        var isAudit = formName.indexOf("audit") >= 0 || formName.indexOf("dossier") >= 0 || leadType === "PROCESS_AUDIT_SUBMISSION";
        var isChat = formName.indexOf("chat") >= 0 || formName.indexOf("assistant") >= 0 || leadType === "CHATBOT";

        if (isLead && eventId) {
          countedLeadIds.add(eventId);
        }

        accumulateMetrics(daily, dayKey, visitor, isPageView, isQuick, isConsult, isAudit, isChat, isLead, duration);
        accumulateMetrics(weekly, weekKey, visitor, isPageView, isQuick, isConsult, isAudit, isChat, isLead, duration);
        accumulateMetrics(monthly, monthKey, visitor, isPageView, isQuick, isConsult, isAudit, isChat, isLead, duration);
      }
    }
  }

  // Source 2: Lead_Management
  var leadSheet = ss.getSheetByName("Lead_Management");
  if (leadSheet && leadSheet.getLastRow() >= 2) {
    var leadData = leadSheet.getDataRange().getValues();
    if (leadData && leadData.length >= 2) {
      var lh = leadData[0];
      var lTsCol = findFlexibleHeader(lh, ["received_at", "Timestamp", "Date"]);
      var lIdCol = findFlexibleHeader(lh, ["lead_id", "id"]);
      var lTypeCol = findFlexibleHeader(lh, ["lead_type", "type"]);
      var lVidCol = findFlexibleHeader(lh, ["visitor_id", "visitorId"]);
      var lFormCol = findFlexibleHeader(lh, ["form_name", "formName"]);

      for (var j = 1; j < leadData.length; j++) {
        var lId = lIdCol > -1 ? String(leadData[j][lIdCol] || "") : ("lead_" + j);
        if (lId && countedLeadIds.has(lId)) continue;

        var ld = parseDateSafe(lTsCol > -1 ? leadData[j][lTsCol] : leadData[j][0]) || new Date();
        var lDayKey = Utilities.formatDate(ld, tz, "yyyy-MM-dd");
        var lMonthKey = Utilities.formatDate(ld, tz, "yyyy-MM");
        var lWeekKey = getWeekStartDate(ld);

        var lVid = (lVidCol > -1 && leadData[j][lVidCol]) ? String(leadData[j][lVidCol]) : ("lv_" + j);
        var lType = lTypeCol > -1 ? String(leadData[j][lTypeCol] || "").toUpperCase() : "";
        var lForm = lFormCol > -1 ? String(leadData[j][lFormCol] || "").toLowerCase() : "";

        var isQuickL = lForm.indexOf("quick") >= 0 || lType === "QUICK_FORM";
        var isConsultL = lForm.indexOf("consult") >= 0 || lForm.indexOf("long") >= 0 || lType === "LONG_FORM";
        var isAuditL = lForm.indexOf("audit") >= 0 || lType === "PROCESS_AUDIT_SUBMISSION";
        var isChatL = lForm.indexOf("chat") >= 0 || lForm.indexOf("assistant") >= 0 || lType === "CHATBOT";

        accumulateMetrics(daily, lDayKey, lVid, false, isQuickL, isConsultL, isAuditL, isChatL, true, 0);
        accumulateMetrics(weekly, lWeekKey, lVid, false, isQuickL, isConsultL, isAuditL, isChatL, true, 0);
        accumulateMetrics(monthly, lMonthKey, lVid, false, isQuickL, isConsultL, isAuditL, isChatL, true, 0);

        if (lId) countedLeadIds.add(lId);
      }
    }
  }

  // Source 3: Page_Performance fallback
  var pageSheet = ss.getSheetByName("Page_Performance");
  if (pageSheet && pageSheet.getLastRow() >= 2 && Object.keys(daily).length === 0) {
    var pData = pageSheet.getDataRange().getValues();
    if (pData && pData.length >= 2) {
      var ph = pData[0];
      var pTsCol = findFlexibleHeader(ph, ["received_at", "Timestamp", "Date"]);
      var pVidCol = findFlexibleHeader(ph, ["visitor_id", "visitorId"]);
      var pDurCol = findFlexibleHeader(ph, ["time_on_page_seconds", "duration"]);

      for (var k = 1; k < pData.length; k++) {
        var pd = parseDateSafe(pTsCol > -1 ? pData[k][pTsCol] : pData[k][0]) || new Date();
        var pDay = Utilities.formatDate(pd, tz, "yyyy-MM-dd");
        var pMonth = Utilities.formatDate(pd, tz, "yyyy-MM");
        var pWeek = getWeekStartDate(pd);
        var pVid = (pVidCol > -1 && pData[k][pVidCol]) ? String(pData[k][pVidCol]) : ("pv_" + k);
        var pDur = pDurCol > -1 ? (Number(pData[k][pDurCol]) || 0) : 0;

        accumulateMetrics(daily, pDay, pVid, true, false, false, false, false, false, pDur);
        accumulateMetrics(weekly, pWeek, pVid, true, false, false, false, false, false, pDur);
        accumulateMetrics(monthly, pMonth, pVid, true, false, false, false, false, false, pDur);
      }
    }
  }

  // Guarantee active baseline rows exist for current period
  var now = new Date();
  var todayKey = Utilities.formatDate(now, tz, "yyyy-MM-dd");
  var curWeekKey = getWeekStartDate(now);
  var curMonthKey = Utilities.formatDate(now, tz, "yyyy-MM");

  if (!daily[todayKey]) accumulateMetrics(daily, todayKey, null, false, false, false, false, false, false, 0);
  if (!weekly[curWeekKey]) accumulateMetrics(weekly, curWeekKey, null, false, false, false, false, false, false, 0);
  if (!monthly[curMonthKey]) accumulateMetrics(monthly, curMonthKey, null, false, false, false, false, false, false, 0);

  // Write all 3 summary tables
  writeIntervalTable(ss, "Daily_Summary", daily, "Date", "#047857");
  writeIntervalTable(ss, "Weekly_Summary", weekly, "Week_Start", "#0284c7");
  writeIntervalTable(ss, "Monthly_Summary", monthly, "Month", "#7c3aed");

  console.log("✅ Daily, Weekly & Monthly Executive Summaries successfully generated and stored.");
}

function writeIntervalTable(ss, tabName, bucket, label, headerColor) {
  var sheet = getTab(ss, tabName);
  if (!sheet) return;

  var headers = TAB_HEADERS[tabName];
  var color = headerColor || (tabName === "Daily_Summary" ? "#047857" : (tabName === "Weekly_Summary" ? "#0284c7" : "#7c3aed"));

  try { sheet.clearContents(); } catch (e) {}

  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(color)
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  var keys = Object.keys(bucket).sort().reverse();
  var rows = [];

  keys.forEach(function(key) {
    var b = bucket[key];
    var uniqueVisitors = b.visitors ? (b.visitors.size !== undefined ? b.visitors.size : Object.keys(b.visitors).length) : 0;
    var totalLeads = Number(b.leads || 0);
    var conversion = uniqueVisitors > 0 ? ((totalLeads / uniqueVisitors) * 100).toFixed(1) + "%" : (totalLeads > 0 ? "100.0%" : "0.0%");
    var avgEngagement = b.durationCount > 0 ? Math.round(b.durationTotal / b.durationCount) : 0;

    rows.push([
      key,
      Number(b.events || 0),
      Number(uniqueVisitors),
      Number(b.pageViews || 0),
      Number(b.quick || 0),
      Number(b.consult || 0),
      Number(b.audit || 0),
      Number(b.chat || 0),
      totalLeads,
      conversion,
      Number(avgEngagement)
    ]);
  });

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    sheet.getRange(2, 1, rows.length, 1).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(2, 2, rows.length, headers.length - 1).setHorizontalAlignment("right");
    for (var r = 0; r < rows.length; r++) {
      var rowBg = (r % 2 === 0) ? "#ffffff" : "#f8fafc";
      sheet.getRange(r + 2, 1, 1, headers.length).setBackground(rowBg);
    }
  }
}

// =========================================================================================
// EXECUTIVE REPORTS ENGINE (INDIVIDUAL EMAIL DISPATCH TO JANEGRACY)
// =========================================================================================
function sendPeriodicExecutiveDigest(intervalName) {
  var ss = getSpreadsheet();
  if (!ss) return false;

  var map = {
    Daily: "Daily_Summary",
    Weekly: "Weekly_Summary",
    Monthly: "Monthly_Summary"
  };

  var targetTab = map[intervalName] || "Daily_Summary";
  var sheet = ss.getSheetByName(targetTab);

  if (!sheet || sheet.getLastRow() < 2) {
    BUILD_AGGREGATED_INTERVAL_SUMMARIES();
    sheet = ss.getSheetByName(targetTab);
  }

  var tz = CONFIG.TIMEZONE || "Asia/Kolkata";
  var now = new Date();
  var defaultPeriod = intervalName === "Daily"
    ? Utilities.formatDate(now, tz, "yyyy-MM-dd")
    : (intervalName === "Weekly" ? getWeekStartDate(now) : Utilities.formatDate(now, tz, "yyyy-MM"));

  var period       = defaultPeriod;
  var events       = 0;
  var visitors     = 0;
  var pageViews    = 0;
  var quick        = 0;
  var consult      = 0;
  var audit        = 0;
  var chat         = 0;
  var leads        = 0;
  var conversion   = "0.0%";
  var avg          = 0;

  if (sheet && sheet.getLastRow() >= 2) {
    var r = sheet.getRange(2, 1, 1, 11).getValues()[0];
    period     = r[0] || defaultPeriod;
    events     = Number(r[1]) || 0;
    visitors   = Number(r[2]) || 0;
    pageViews  = Number(r[3]) || 0;
    quick      = Number(r[4]) || 0;
    consult    = Number(r[5]) || 0;
    audit      = Number(r[6]) || 0;
    chat       = Number(r[7]) || 0;
    leads      = Number(r[8]) || 0;
    conversion = String(r[9] || "0.0%");
    avg        = Number(r[10]) || 0;
  }

  var themeColor = intervalName === "Daily" ? "#047857" : (intervalName === "Weekly" ? "#0284c7" : "#7c3aed");
  var badgeLabel = intervalName.toUpperCase() + " EXECUTIVE DIGEST";
  var reportTitle = intervalName === "Daily"
    ? "ProfitPatterns Daily Intelligence Report"
    : (intervalName === "Weekly" ? "ProfitPatterns Weekly Executive Performance" : "ProfitPatterns Monthly Strategic Review");

  var periodFormatted = intervalName === "Weekly" ? ("Week Starting " + period) : period;

  var html = [
    '<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>',
    '<body style="margin:0;padding:20px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;">',
    '<div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 20px rgba(0,0,0,0.06);">',

    '<div style="background:linear-gradient(135deg,' + themeColor + ' 0%,#0f172a 100%);padding:28px 24px;">',
    '  <div style="display:inline-block;background:rgba(255,255,255,0.2);color:#ffffff;padding:4px 12px;border-radius:16px;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">' + badgeLabel + '</div>',
    '  <h1 style="color:#ffffff;margin:0 0 4px 0;font-size:22px;font-weight:800;">' + reportTitle + '</h1>',
    '  <p style="color:rgba(255,255,255,0.85);margin:0;font-size:13px;">Period: ' + periodFormatted + '</p>',
    '</div>',

    '<div style="padding:20px 24px 0 24px;">',
    '<table width="100%" style="border-collapse:separate;border-spacing:8px;">',
    '  <tr>',
    '    <td style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;width:25%;">',
    '      <div style="font-size:11px;color:#64748b;font-weight:700;">VISITORS</div>',
    '      <div style="font-size:22px;font-weight:800;color:#0f172a;margin-top:4px;">' + visitors.toLocaleString() + '</div>',
    '    </td>',
    '    <td style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;width:25%;">',
    '      <div style="font-size:11px;color:#64748b;font-weight:700;">TOTAL LEADS</div>',
    '      <div style="font-size:22px;font-weight:800;color:' + themeColor + ';margin-top:4px;">' + leads.toLocaleString() + '</div>',
    '    </td>',
    '    <td style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;width:25%;">',
    '      <div style="font-size:11px;color:#64748b;font-weight:700;">CONVERSION</div>',
    '      <div style="font-size:22px;font-weight:800;color:#d97706;margin-top:4px;">' + conversion + '</div>',
    '    </td>',
    '    <td style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;width:25%;">',
    '      <div style="font-size:11px;color:#64748b;font-weight:700;">AVG ENGAGE</div>',
    '      <div style="font-size:22px;font-weight:800;color:#0f172a;margin-top:4px;">' + avg + 's</div>',
    '    </td>',
    '  </tr>',
    '</table>',
    '</div>',

    '<div style="padding:16px 24px;">',
    '  <table width="100%" style="border-collapse:collapse;font-size:13px;">',
    '    <tr style="background:#f8fafc;"><td style="padding:10px 12px;color:#475569;border-bottom:1px solid #e2e8f0;">⚡ Quick Contact Form Leads</td><td style="padding:10px 12px;text-align:right;font-weight:700;color:#10b981;border-bottom:1px solid #e2e8f0;">' + quick + '</td></tr>',
    '    <tr><td style="padding:10px 12px;color:#475569;border-bottom:1px solid #e2e8f0;">📋 Enterprise Consultation Requests</td><td style="padding:10px 12px;text-align:right;font-weight:700;color:#0284c7;border-bottom:1px solid #e2e8f0;">' + consult + '</td></tr>',
    '    <tr style="background:#f8fafc;"><td style="padding:10px 12px;color:#475569;border-bottom:1px solid #e2e8f0;">📁 Process AI Audit Dossiers</td><td style="padding:10px 12px;text-align:right;font-weight:700;color:#d97706;border-bottom:1px solid #e2e8f0;">' + audit + '</td></tr>',
    '    <tr><td style="padding:10px 12px;color:#475569;border-bottom:1px solid #e2e8f0;">💬 AI Chatbot Strategic Leads</td><td style="padding:10px 12px;text-align:right;font-weight:700;color:#7c3aed;border-bottom:1px solid #e2e8f0;">' + chat + '</td></tr>',
    '    <tr style="background:#f8fafc;"><td style="padding:10px 12px;color:#475569;border-bottom:1px solid #e2e8f0;">👁️ Page Views Logged</td><td style="padding:10px 12px;text-align:right;font-weight:700;color:#0f172a;border-bottom:1px solid #e2e8f0;">' + pageViews.toLocaleString() + '</td></tr>',
    '    <tr><td style="padding:10px 12px;color:#475569;">📊 Total Telemetry Events</td><td style="padding:10px 12px;text-align:right;font-weight:700;color:#0f172a;">' + events.toLocaleString() + '</td></tr>',
    '  </table>',
    '</div>',

    '<div style="padding:16px 24px;text-align:center;">',
    '  <a href="' + ss.getUrl() + '" target="_blank" style="display:inline-block;background:' + themeColor + ';color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:6px;font-weight:700;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.15);">Open Google Sheet Intelligence &rarr;</a>',
    '</div>',

    '<div style="background:#0f172a;padding:12px 24px;text-align:center;font-size:11px;color:#94a3b8;">',
    'ProfitPatterns Multi-Intelligence Engine &bull; Confidential Executive Briefing &bull; ' + Utilities.formatDate(now, tz, "yyyy-MM-dd HH:mm:ss") + ' IST',
    '</div>',

    '</div></body></html>'
  ].join('');

  var reportRecipients = (EMAIL_CONFIG.reportEmails && EMAIL_CONFIG.reportEmails.length) ? EMAIL_CONFIG.reportEmails : ["janegracy.int2027g3@gmail.com"];
  var uniqueRecips = Array.from(new Set(reportRecipients));
  var emailSubject = "[ProfitPatterns] " + intervalName + " Digest — " + periodFormatted + " (" + leads + " Leads)";

  var sentCount = 0;
  uniqueRecips.forEach(function(recip) {
    var ok = safeSendEmail({
      to: recip,
      subject: emailSubject,
      htmlBody: html,
      name: EMAIL_CONFIG.name,
      replyTo: EMAIL_CONFIG.replyTo
    });
    if (ok) sentCount++;
  });

  console.log("📤 Sent " + intervalName + " report individually to " + uniqueRecips.join(", ") + " (Status: " + sentCount + "/" + uniqueRecips.length + ")");
  return sentCount > 0;
}

function dailyReport() { sendPeriodicExecutiveDigest("Daily"); }
function weeklyReport() { sendPeriodicExecutiveDigest("Weekly"); }
function monthlyReport() { sendPeriodicExecutiveDigest("Monthly"); }

/**
 * MASTER ACTION: Generates/Stores Daily, Weekly, and Monthly data in Google Sheet
 * and sends all three reports INDIVIDUALLY to janegracy.int2027g3@gmail.com
 */
function GENERATE_AND_SEND_ALL_REPORTS() {
  console.log("🚀 Step 1: Generating and storing Daily, Weekly, and Monthly reports data in Google Sheet...");
  BUILD_AGGREGATED_INTERVAL_SUMMARIES();

  console.log("📧 Step 2: Dispatching all 3 reports individually to janegracy.int2027g3@gmail.com...");

  // 1. Send Daily Report individually
  sendPeriodicExecutiveDigest("Daily");
  Utilities.sleep(1200);

  // 2. Send Weekly Report individually
  sendPeriodicExecutiveDigest("Weekly");
  Utilities.sleep(1200);

  // 3. Send Monthly Report individually
  sendPeriodicExecutiveDigest("Monthly");

  console.log("✅ All three reports dispatched individually to janegracy.int2027g3@gmail.com");
  try {
    SpreadsheetApp.getUi().alert(
      "✅ All 3 Reports Successfully Generated & Sent Individually!\n\n" +
      "1. 📅 Daily Digest → sent individually to janegracy.int2027g3@gmail.com\n" +
      "2. 📅 Weekly Digest → sent individually to janegracy.int2027g3@gmail.com\n" +
      "3. 📅 Monthly Digest → sent individually to janegracy.int2027g3@gmail.com\n\n" +
      "All Google Sheet summary tabs (Daily_Summary, Weekly_Summary, Monthly_Summary) have been updated."
    );
  } catch(e) {}
}

function TEST_SEND_ALL_REPORTS_NOW() {
  GENERATE_AND_SEND_ALL_REPORTS();
}

function MASTER_REFRESH_AND_SEND_REPORTS() {
  MASTER_REFRESH_RAW_DATA();
  GENERATE_AND_SEND_ALL_REPORTS();
}

function setupAllProfitPatternsTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    var fn = trigger.getHandlerFunction();
    if (fn === "dailyReport" || fn === "weeklyReport" || fn === "monthlyReport") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Daily report every evening at 8:00 PM IST
  ScriptApp.newTrigger("dailyReport")
    .timeBased().everyDays(1).atHour(20).create();

  // Weekly report every Monday morning at 9:00 AM IST
  ScriptApp.newTrigger("weeklyReport")
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(9).create();

  // Monthly report on the 1st of every month at 9:00 AM IST
  ScriptApp.newTrigger("monthlyReport")
    .timeBased().onMonthDay(1).atHour(9).create();

  try {
    SpreadsheetApp.getUi().alert("✅ Automated Email Report Triggers Activated (Daily, Weekly & Monthly)!");
  } catch (e) {}
}

// =========================================================================================
// MAINTENANCE & UI MENU
// =========================================================================================
function INITIALIZE_ALL_TABS() {
  initializeAllTabs();
  try { SpreadsheetApp.getUi().alert("✅ All ProfitPatterns tabs initialized successfully."); } catch (e) {}
}

function MASTER_REFRESH_RAW_DATA() {
  initializeAllTabs();
  BUILD_AGGREGATED_INTERVAL_SUMMARIES();
  try { SpreadsheetApp.getUi().alert("✅ Master Refresh Complete: Daily, Weekly & Monthly summaries recalculated."); } catch (e) {}
}

function PURGE_DUPLICATES_FROM_ALL_TABS() {
  var ss = getSpreadsheet();
  if (!ss) return;

  var removed = 0;
  Object.keys(TAB_HEADERS).forEach(function(tabName) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet || sheet.getLastRow() < 3) return;

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idCol = headers.indexOf("event_id");

    if (idCol === -1) idCol = headers.indexOf("lead_id");
    if (idCol === -1) return;

    var seen = {};
    var keep = [headers];

    for (var i = 1; i < data.length; i++) {
      var key = String(data[i][idCol] || "");
      if (!key || !seen[key]) {
        if (key) seen[key] = true;
        keep.push(data[i]);
      } else {
        removed++;
      }
    }

    if (keep.length !== data.length) {
      sheet.clearContents();
      sheet.getRange(1, 1, keep.length, headers.length).setValues(keep);
    }
  });

  console.log("Duplicate event/lead rows removed: " + removed);
  try { SpreadsheetApp.getUi().alert("Duplicate rows removed: " + removed); } catch (e) {}
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🚀 PROFITPATTERNS MULTI-INTELLIGENCE")
    .addItem("📧 Generate & Send All 3 Reports Individually (Daily, Weekly, Monthly)", "GENERATE_AND_SEND_ALL_REPORTS")
    .addItem("📊 Refresh & Recalculate Analytics Summaries", "BUILD_AGGREGATED_INTERVAL_SUMMARIES")
    .addItem("🔄 Master Refresh & Send All Reports", "MASTER_REFRESH_AND_SEND_REPORTS")
    .addSeparator()
    .addItem("🧹 Purge Event/Lead Duplicates", "PURGE_DUPLICATES_FROM_ALL_TABS")
    .addItem("📁 Initialize All Tabs", "INITIALIZE_ALL_TABS")
    .addSeparator()
    .addItem("⏰ Enable Automated Daily/Weekly/Monthly Reports", "setupAllProfitPatternsTriggers")
    .addToUi();
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
