import * as migration_20260925_111836_initial from './20260925_111836_initial';
import * as migration_20260925_134649_quotation_band from './20260925_134649_quotation_band';
import * as migration_20260925_135034_quotation_second_passage from './20260925_135034_quotation_second_passage';
import * as migration_20260925_150727_section_descriptions from './20260925_150727_section_descriptions';
import * as migration_20260925_150957_headline_italic from './20260925_150957_headline_italic';
import * as migration_20260926_041707_section_intros from './20260926_041707_section_intros';
import * as migration_20260928_105405_photo_festival_tags from './20260928_105405_photo_festival_tags';
import * as migration_20260928_110504_festival_months from './20260928_110504_festival_months';
import * as migration_20260930_102837_photo_show_first_taken_on from './20260930_102837_photo_show_first_taken_on';
import * as migration_20261001_131421_temple_stories from './20261001_131421_temple_stories';
import * as migration_20261002_122418_temple_short_name from './20261002_122418_temple_short_name';
import * as migration_20261009_133056_occasion_town_wide_tbc from './20261009_133056_occasion_town_wide_tbc';
import * as migration_20261009_140000_database_log_import from './20261009_140000_database_log_import';
import * as migration_20261010_090000_field_note_edits from './20261010_090000_field_note_edits';
import * as migration_20261010_150000_field_note_edits_2 from './20261010_150000_field_note_edits_2';
import * as migration_20261010_160000_special_nakshatras from './20261010_160000_special_nakshatras';
import * as migration_20261010_170000_weekly_rituals from './20261010_170000_weekly_rituals';
import * as migration_20261010_180000_varam_days from './20261010_180000_varam_days';
import * as migration_20261012_095753_special_tithis from './20261012_095753_special_tithis';
import * as migration_20261013_093604_layout_order from './20261013_093604_layout_order';
import * as migration_20261013_123338_temple_listed from './20261013_123338_temple_listed';
import * as migration_20261013_125633_temple_names from './20261013_125633_temple_names';
import * as migration_20261013_155723_layout_faces from './20261013_155723_layout_faces';
import * as migration_20261019_124443_film_files from './20261019_124443_film_files';
import * as migration_20261019_183000_short_name_thiruvahindrapuram from './20261019_183000_short_name_thiruvahindrapuram';
import * as migration_20261021_101017_observance_recurs from './20261021_101017_observance_recurs';
import * as migration_20261021_130458_regular_rituals from './20261021_130458_regular_rituals';
import * as migration_20261021_160804_regular_ritual_sets from './20261021_160804_regular_ritual_sets';
import * as migration_20261021_164954_temple_faces from './20261021_164954_temple_faces';
import * as migration_20261022_062621_drawing_shown from './20261022_062621_drawing_shown';
import * as migration_20261022_064855_drawing_cut from './20261022_064855_drawing_cut';
import * as migration_20261022_070227_drawing_stack_drag from './20261022_070227_drawing_stack_drag';
import * as migration_20261022_070238_drawing_drop_layout_order from './20261022_070238_drawing_drop_layout_order';
import * as migration_20261022_071527_drawing_cover_only from './20261022_071527_drawing_cover_only';
import * as migration_20261022_073543_regular_rituals_at_temples from './20261022_073543_regular_rituals_at_temples';
import * as migration_20261022_073558_regular_rituals_old_fields from './20261022_073558_regular_rituals_old_fields';
import * as migration_20261022_093316_regular_rituals_by_weekday from './20261022_093316_regular_rituals_by_weekday';
import * as migration_20261022_100844_regular_rituals_weekday from './20261022_100844_regular_rituals_weekday';
import * as migration_20261022_100953_regular_rituals_times_days from './20261022_100953_regular_rituals_times_days';

export const migrations = [
  {
    up: migration_20260925_111836_initial.up,
    down: migration_20260925_111836_initial.down,
    name: '20260925_111836_initial',
  },
  {
    up: migration_20260925_134649_quotation_band.up,
    down: migration_20260925_134649_quotation_band.down,
    name: '20260925_134649_quotation_band',
  },
  {
    up: migration_20260925_135034_quotation_second_passage.up,
    down: migration_20260925_135034_quotation_second_passage.down,
    name: '20260925_135034_quotation_second_passage',
  },
  {
    up: migration_20260925_150727_section_descriptions.up,
    down: migration_20260925_150727_section_descriptions.down,
    name: '20260925_150727_section_descriptions',
  },
  {
    up: migration_20260925_150957_headline_italic.up,
    down: migration_20260925_150957_headline_italic.down,
    name: '20260925_150957_headline_italic',
  },
  {
    up: migration_20260926_041707_section_intros.up,
    down: migration_20260926_041707_section_intros.down,
    name: '20260926_041707_section_intros',
  },
  {
    up: migration_20260928_105405_photo_festival_tags.up,
    down: migration_20260928_105405_photo_festival_tags.down,
    name: '20260928_105405_photo_festival_tags',
  },
  {
    up: migration_20260928_110504_festival_months.up,
    down: migration_20260928_110504_festival_months.down,
    name: '20260928_110504_festival_months',
  },
  {
    up: migration_20260930_102837_photo_show_first_taken_on.up,
    down: migration_20260930_102837_photo_show_first_taken_on.down,
    name: '20260930_102837_photo_show_first_taken_on',
  },
  {
    up: migration_20261001_131421_temple_stories.up,
    down: migration_20261001_131421_temple_stories.down,
    name: '20261001_131421_temple_stories',
  },
  {
    up: migration_20261002_122418_temple_short_name.up,
    down: migration_20261002_122418_temple_short_name.down,
    name: '20261002_122418_temple_short_name',
  },
  {
    up: migration_20261009_133056_occasion_town_wide_tbc.up,
    down: migration_20261009_133056_occasion_town_wide_tbc.down,
    name: '20261009_133056_occasion_town_wide_tbc',
  },
  {
    up: migration_20261009_140000_database_log_import.up,
    down: migration_20261009_140000_database_log_import.down,
    name: '20261009_140000_database_log_import',
  },
  {
    up: migration_20261010_090000_field_note_edits.up,
    down: migration_20261010_090000_field_note_edits.down,
    name: '20261010_090000_field_note_edits',
  },
  {
    up: migration_20261010_150000_field_note_edits_2.up,
    down: migration_20261010_150000_field_note_edits_2.down,
    name: '20261010_150000_field_note_edits_2',
  },
  {
    up: migration_20261010_160000_special_nakshatras.up,
    down: migration_20261010_160000_special_nakshatras.down,
    name: '20261010_160000_special_nakshatras',
  },
  {
    up: migration_20261010_170000_weekly_rituals.up,
    down: migration_20261010_170000_weekly_rituals.down,
    name: '20261010_170000_weekly_rituals',
  },
  {
    up: migration_20261010_180000_varam_days.up,
    down: migration_20261010_180000_varam_days.down,
    name: '20261010_180000_varam_days',
  },
  {
    up: migration_20261012_095753_special_tithis.up,
    down: migration_20261012_095753_special_tithis.down,
    name: '20261012_095753_special_tithis',
  },
  {
    up: migration_20261013_093604_layout_order.up,
    down: migration_20261013_093604_layout_order.down,
    name: '20261013_093604_layout_order',
  },
  {
    up: migration_20261013_123338_temple_listed.up,
    down: migration_20261013_123338_temple_listed.down,
    name: '20261013_123338_temple_listed',
  },
  {
    up: migration_20261013_125633_temple_names.up,
    down: migration_20261013_125633_temple_names.down,
    name: '20261013_125633_temple_names',
  },
  {
    up: migration_20261013_155723_layout_faces.up,
    down: migration_20261013_155723_layout_faces.down,
    name: '20261013_155723_layout_faces',
  },
  {
    up: migration_20261019_124443_film_files.up,
    down: migration_20261019_124443_film_files.down,
    name: '20261019_124443_film_files',
  },
  {
    up: migration_20261019_183000_short_name_thiruvahindrapuram.up,
    down: migration_20261019_183000_short_name_thiruvahindrapuram.down,
    name: '20261019_183000_short_name_thiruvahindrapuram',
  },
  {
    up: migration_20261021_101017_observance_recurs.up,
    down: migration_20261021_101017_observance_recurs.down,
    name: '20261021_101017_observance_recurs',
  },
  {
    up: migration_20261021_130458_regular_rituals.up,
    down: migration_20261021_130458_regular_rituals.down,
    name: '20261021_130458_regular_rituals',
  },
  {
    up: migration_20261021_160804_regular_ritual_sets.up,
    down: migration_20261021_160804_regular_ritual_sets.down,
    name: '20261021_160804_regular_ritual_sets',
  },
  {
    up: migration_20261021_164954_temple_faces.up,
    down: migration_20261021_164954_temple_faces.down,
    name: '20261021_164954_temple_faces',
  },
  {
    up: migration_20261022_062621_drawing_shown.up,
    down: migration_20261022_062621_drawing_shown.down,
    name: '20261022_062621_drawing_shown',
  },
  {
    up: migration_20261022_064855_drawing_cut.up,
    down: migration_20261022_064855_drawing_cut.down,
    name: '20261022_064855_drawing_cut',
  },
  {
    up: migration_20261022_070227_drawing_stack_drag.up,
    down: migration_20261022_070227_drawing_stack_drag.down,
    name: '20261022_070227_drawing_stack_drag',
  },
  {
    up: migration_20261022_070238_drawing_drop_layout_order.up,
    down: migration_20261022_070238_drawing_drop_layout_order.down,
    name: '20261022_070238_drawing_drop_layout_order',
  },
  {
    up: migration_20261022_071527_drawing_cover_only.up,
    down: migration_20261022_071527_drawing_cover_only.down,
    name: '20261022_071527_drawing_cover_only',
  },
  {
    up: migration_20261022_073543_regular_rituals_at_temples.up,
    down: migration_20261022_073543_regular_rituals_at_temples.down,
    name: '20261022_073543_regular_rituals_at_temples',
  },
  {
    up: migration_20261022_073558_regular_rituals_old_fields.up,
    down: migration_20261022_073558_regular_rituals_old_fields.down,
    name: '20261022_073558_regular_rituals_old_fields',
  },
  {
    up: migration_20261022_093316_regular_rituals_by_weekday.up,
    down: migration_20261022_093316_regular_rituals_by_weekday.down,
    name: '20261022_093316_regular_rituals_by_weekday',
  },
  {
    up: migration_20261022_100844_regular_rituals_weekday.up,
    down: migration_20261022_100844_regular_rituals_weekday.down,
    name: '20261022_100844_regular_rituals_weekday',
  },
  {
    up: migration_20261022_100953_regular_rituals_times_days.up,
    down: migration_20261022_100953_regular_rituals_times_days.down,
    name: '20261022_100953_regular_rituals_times_days'
  },
];
