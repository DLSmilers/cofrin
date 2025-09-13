-- Expand access_logs table to support comprehensive logging
ALTER TABLE public.access_logs 
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS transaction_type TEXT,
ADD COLUMN IF NOT EXISTS transaction_amount DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS affected_table TEXT,
ADD COLUMN IF NOT EXISTS record_id TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON public.access_logs(action);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_affected_table ON public.access_logs(affected_table);

-- Function to log user actions
CREATE OR REPLACE FUNCTION public.log_user_action(
  p_user_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT '{}',
  p_transaction_type TEXT DEFAULT NULL,
  p_transaction_amount DOUBLE PRECISION DEFAULT NULL,
  p_affected_table TEXT DEFAULT NULL,
  p_record_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_name TEXT;
  v_user_whatsapp TEXT;
  v_log_id UUID;
BEGIN
  -- Get user info
  SELECT 
    (p.first_name || ' ' || p.last_name) as full_name,
    u.user_whatsapp
  INTO v_user_name, v_user_whatsapp
  FROM profiles p
  LEFT JOIN users u ON u.uuid = p.user_id
  WHERE p.user_id = p_user_id;

  -- Insert log entry
  INSERT INTO public.access_logs (
    user_id,
    user_name,
    user_whatsapp,
    action,
    details,
    transaction_type,
    transaction_amount,
    affected_table,
    record_id,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    COALESCE(v_user_name, 'Usuário Desconhecido'),
    v_user_whatsapp,
    p_action,
    p_details,
    p_transaction_type,
    p_transaction_amount,
    p_affected_table,
    p_record_id,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$function$;