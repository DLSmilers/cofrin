-- Create triggers to automatically log actions on important tables

-- Trigger function for transacoes
CREATE OR REPLACE FUNCTION public.log_transacao_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id UUID;
  v_action TEXT;
  v_details JSONB;
BEGIN
  -- Get user_id from user_whatsapp
  SELECT uuid INTO v_user_id 
  FROM users 
  WHERE user_whatsapp = COALESCE(NEW.user_whatsapp, OLD.user_whatsapp);

  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'transaction_created';
    v_details := jsonb_build_object(
      'estabelecimento', NEW.estabelecimento,
      'categoria', NEW.categoria,
      'tipo', NEW.tipo,
      'detalhes', NEW.detalhes
    );
    
    PERFORM log_user_action(
      v_user_id,
      v_action,
      v_details,
      NEW.tipo,
      NEW.valor,
      'transacoes',
      NEW.id::text
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'transaction_updated';
    v_details := jsonb_build_object(
      'old_valor', OLD.valor,
      'new_valor', NEW.valor,
      'estabelecimento', NEW.estabelecimento
    );
    
    PERFORM log_user_action(
      v_user_id,
      v_action,
      v_details,
      NEW.tipo,
      NEW.valor,
      'transacoes',
      NEW.id::text
    );
    
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'transaction_deleted';
    v_details := jsonb_build_object(
      'estabelecimento', OLD.estabelecimento,
      'valor', OLD.valor,
      'tipo', OLD.tipo
    );
    
    PERFORM log_user_action(
      v_user_id,
      v_action,
      v_details,
      OLD.tipo,
      OLD.valor,
      'transacoes',
      OLD.id::text
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Trigger function for metas
CREATE OR REPLACE FUNCTION public.log_meta_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id UUID;
  v_action TEXT;
  v_details JSONB;
BEGIN
  -- Get user_id from user_whatsapp
  SELECT uuid INTO v_user_id 
  FROM users 
  WHERE user_whatsapp = COALESCE(NEW.user_whatsapp, OLD.user_whatsapp);

  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'goal_created';
    v_details := jsonb_build_object(
      'meta_mensal', NEW.meta_mensal,
      'mes_ano', NEW.mes_ano,
      'tipo_meta', NEW.tipo_meta
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'goal_updated';
    v_details := jsonb_build_object(
      'old_meta', OLD.meta_mensal,
      'new_meta', NEW.meta_mensal,
      'mes_ano', NEW.mes_ano
    );
    
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'goal_deleted';
    v_details := jsonb_build_object(
      'meta_mensal', OLD.meta_mensal,
      'mes_ano', OLD.mes_ano
    );
  END IF;

  PERFORM log_user_action(
    v_user_id,
    v_action,
    v_details,
    NULL,
    COALESCE(NEW.meta_mensal, OLD.meta_mensal),
    'metas',
    COALESCE(NEW.id, OLD.id)::text
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Trigger function for pagamentos_parcelados
CREATE OR REPLACE FUNCTION public.log_parceled_payment_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id UUID;
  v_action TEXT;
  v_details JSONB;
BEGIN
  -- Get user_id from user_whatsapp
  SELECT uuid INTO v_user_id 
  FROM users 
  WHERE user_whatsapp = COALESCE(NEW.user_whatsapp, OLD.user_whatsapp);

  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'parceled_payment_created';
    v_details := jsonb_build_object(
      'descricao', NEW.descricao,
      'estabelecimento', NEW.estabelecimento,
      'total_parcelas', NEW.total_parcelas,
      'parcela_atual', NEW.parcela_atual,
      'data_vencimento', NEW.data_vencimento
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'parceled_payment_updated';
    v_details := jsonb_build_object(
      'descricao', NEW.descricao,
      'old_status', OLD.status,
      'new_status', NEW.status,
      'parcela_atual', NEW.parcela_atual
    );
    
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'parceled_payment_deleted';
    v_details := jsonb_build_object(
      'descricao', OLD.descricao,
      'valor_total', OLD.valor_total
    );
  END IF;

  PERFORM log_user_action(
    v_user_id,
    v_action,
    v_details,
    'pagamento_parcelado',
    COALESCE(NEW.valor_total, OLD.valor_total),
    'pagamentos_parcelados',
    COALESCE(NEW.id, OLD.id)::text
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create the triggers
DROP TRIGGER IF EXISTS trigger_log_transacao_action ON public.transacoes;
CREATE TRIGGER trigger_log_transacao_action
  AFTER INSERT OR UPDATE OR DELETE ON public.transacoes
  FOR EACH ROW EXECUTE FUNCTION log_transacao_action();

DROP TRIGGER IF EXISTS trigger_log_meta_action ON public.metas;
CREATE TRIGGER trigger_log_meta_action
  AFTER INSERT OR UPDATE OR DELETE ON public.metas
  FOR EACH ROW EXECUTE FUNCTION log_meta_action();

DROP TRIGGER IF EXISTS trigger_log_parceled_payment_action ON public.pagamentos_parcelados;
CREATE TRIGGER trigger_log_parceled_payment_action
  AFTER INSERT OR UPDATE OR DELETE ON public.pagamentos_parcelados
  FOR EACH ROW EXECUTE FUNCTION log_parceled_payment_action();