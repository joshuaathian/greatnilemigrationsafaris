create function public.move_itinerary_day(day_id uuid,direction integer) returns void language plpgsql security invoker set search_path=public as $$
declare current_day public.itinerary_days;other_day public.itinerary_days;temp_number integer;
begin
 if not public.is_admin() then raise exception 'Unauthorized'; end if;
 if direction not in (-1,1) then raise exception 'Invalid direction'; end if;
 select * into current_day from public.itinerary_days where id=day_id for update;
 if current_day.id is null then raise exception 'Day not found'; end if;
 perform pg_advisory_xact_lock(hashtext(current_day.itinerary_id::text));
 select * into other_day from public.itinerary_days where itinerary_id=current_day.itinerary_id and day_number=current_day.day_number+direction for update;
 if other_day.id is null then return; end if;
 select max(day_number)+1 into temp_number from public.itinerary_days where itinerary_id=current_day.itinerary_id;
 update public.itinerary_days set day_number=temp_number where id=current_day.id;
 update public.itinerary_days set day_number=current_day.day_number where id=other_day.id;
 update public.itinerary_days set day_number=other_day.day_number where id=current_day.id;
end $$;
