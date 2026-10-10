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
];
