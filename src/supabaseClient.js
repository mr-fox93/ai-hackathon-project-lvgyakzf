import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ayquumuhxfnmfwnflddm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cXV1bXVoeGZubWZ3bmZsZGRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNDE2NDgwOSwiZXhwIjoyMDI5NzQwODA5fQ.VzGuoSSqD17x0wfcxD7JHrsHHfJw6ruNOUlECIQjbd8";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
