

export const DB_TO_UI_STAGE = {
  draft: "submitted",
  pending: "submitted",
  submitted: "submitted",
  mara_review: "submitted",
  approved: "approved",
  scheduled: "approved",
  live: "approved",
  expired: "expired",
  denied: "expired",
};


  
 
export const UI_TO_DB_STAGE = {
  submitted: "submitted",
  approved: "approved",
  expired: "expired",
};




export function toUiStage(dbStatus) {
  return DB_TO_UI_STAGE[dbStatus] || "submitted";
}

export function toDbStatus(uiStage) {
  return UI_TO_DB_STAGE[uiStage] || null;
}