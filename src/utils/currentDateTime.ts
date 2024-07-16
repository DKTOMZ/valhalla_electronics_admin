/** Current date time for local region where code is running */
export const CURRENT_DATE_TIME = () => new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString();