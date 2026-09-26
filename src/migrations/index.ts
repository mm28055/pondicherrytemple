import * as migration_20260925_111836_initial from './20260925_111836_initial';
import * as migration_20260925_134649_quotation_band from './20260925_134649_quotation_band';
import * as migration_20260925_135034_quotation_second_passage from './20260925_135034_quotation_second_passage';
import * as migration_20260925_150727_section_descriptions from './20260925_150727_section_descriptions';
import * as migration_20260925_150957_headline_italic from './20260925_150957_headline_italic';
import * as migration_20260926_041707_section_intros from './20260926_041707_section_intros';

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
    name: '20260926_041707_section_intros'
  },
];
