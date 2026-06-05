import { supabase } from '../lib/supabase';
import type { HabitCommand, CommandResult } from './types';

export async function dispatch(command: HabitCommand): Promise<CommandResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  switch (command.type) {

    case 'CREATE_HABIT': {
      const p = command.payload;
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id:              user.id,
          name:                 p.name,
          emoji:                p.emoji ?? null,
          cue:                  p.cue,
          craving:              p.craving,
          response:             p.response,
          reward:               p.reward,
          identity_statement:   p.identityStatement ?? null,
          two_minute_version:   p.twoMinuteVersion ?? null,
          frequency:            p.frequency,
          target_days_per_week: p.targetDaysPerWeek ?? null,
          reminder_time:        p.reminderTime ?? null,
          category:             p.category,
          is_active:            p.isActive,
        })
        .select('id')
        .single();
      if (error) return { ok: false, error: error.message };
      return { ok: true, id: data.id };
    }

    case 'UPDATE_HABIT': {
      const { id, ...patch } = command.payload;
      const dbPatch: Record<string, unknown> = {};
      if (patch.name              !== undefined) dbPatch.name                 = patch.name;
      if (patch.emoji             !== undefined) dbPatch.emoji                = patch.emoji;
      if (patch.cue               !== undefined) dbPatch.cue                  = patch.cue;
      if (patch.craving           !== undefined) dbPatch.craving              = patch.craving;
      if (patch.response          !== undefined) dbPatch.response             = patch.response;
      if (patch.reward            !== undefined) dbPatch.reward               = patch.reward;
      if (patch.identityStatement !== undefined) dbPatch.identity_statement   = patch.identityStatement;
      if (patch.twoMinuteVersion  !== undefined) dbPatch.two_minute_version   = patch.twoMinuteVersion;
      if (patch.frequency         !== undefined) dbPatch.frequency            = patch.frequency;
      if (patch.targetDaysPerWeek !== undefined) dbPatch.target_days_per_week = patch.targetDaysPerWeek;
      if (patch.reminderTime      !== undefined) dbPatch.reminder_time        = patch.reminderTime;
      if (patch.category          !== undefined) dbPatch.category             = patch.category;
      if (patch.isActive          !== undefined) dbPatch.is_active            = patch.isActive;
      const { error } = await supabase.from('habits').update(dbPatch).eq('id', id);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    }

    case 'ARCHIVE_HABIT': {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', command.payload.id);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    }

    case 'TOGGLE_CHECKOFF': {
      const { habitId, date, note } = command.payload;
      const dayStart = `${date}T00:00:00.000Z`;
      const dayEnd   = `${date}T23:59:59.999Z`;

      const { data: existing } = await supabase
        .from('checkoffs')
        .select('id')
        .eq('habit_id', habitId)
        .gte('completed_at', dayStart)
        .lte('completed_at', dayEnd)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from('checkoffs').delete().eq('id', existing.id);
        if (error) return { ok: false, error: error.message };
      } else {
        const { error } = await supabase.from('checkoffs').insert({
          habit_id:     habitId,
          user_id:      user.id,
          completed_at: `${date}T12:00:00.000Z`,
          note:         note ?? null,
        });
        if (error) return { ok: false, error: error.message };
      }
      return { ok: true };
    }
  }
}
