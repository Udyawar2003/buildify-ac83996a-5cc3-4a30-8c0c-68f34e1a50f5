
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lrykjvvuoesjzzjqccto.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyeWtqdnZ1b2Vzanp6anFjY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzgxMjksImV4cCI6MjA2ODA1NDEyOX0.r6n7WerikaEMQmXLK2fU3adbUApKV2xni3cq2L2nkvU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);