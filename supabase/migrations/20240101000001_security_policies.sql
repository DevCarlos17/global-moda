-- ============================================================
-- Políticas de seguridad adicionales
-- ============================================================

-- Ningún usuario puede modificar su propio role desde el frontend.
-- El role solo puede cambiarse via service_role (Edge Functions).
--
-- Como los updates de profiles ya requieren ser admin (política anterior),
-- los vendedores no pueden hacer UPDATE en la tabla profiles en absoluto.
-- Esta función extra previene que un admin cambie su propio role accidentalmente.

create or replace function public.prevent_role_downgrade()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Si se intenta cambiar el role del único admin del sistema, bloquearlo
  if old.role = 'admin' and new.role != 'admin' then
    -- Verificar si hay al least otro admin
    if (select count(*) from public.profiles where role = 'admin' and id != old.id) = 0 then
      raise exception 'No puedes eliminar el último admin del sistema.';
    end if;
  end if;
  return new;
end;
$$;

create trigger check_role_downgrade
  before update of role on public.profiles
  for each row execute function public.prevent_role_downgrade();

-- ============================================================
-- Nota sobre signup público
-- ============================================================
-- El signup público debe estar DESHABILITADO en Supabase Dashboard:
--   Authentication → Providers → Email → desmarcar "Allow new users to sign up"
--
-- Así solo los admins pueden crear usuarios a través de la Edge Function
-- `create-user`, que verifica el role del llamador antes de crear.
-- ============================================================
