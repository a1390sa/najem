-- =========================================================================
-- سكريبت تعديل الأرقام المرجعية للعمليات السابقة إلى أرقام تسلسلية KM-001 إلى KM-069
-- منصة نجم لإدارة المعرفة - قاعدة بيانات Supabase (PostgreSQL)
-- =========================================================================

BEGIN;

-- 1. ترقية قيود المفاتيح الأجنبية لتفعيل التحديث المتتالي (ON UPDATE CASCADE)
ALTER TABLE form1_critical_processes DROP CONSTRAINT IF EXISTS form1_critical_processes_id_fkey;
ALTER TABLE form1_critical_processes ADD CONSTRAINT form1_critical_processes_id_fkey FOREIGN KEY (id) REFERENCES submissions(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE form2_knowledge_documentation DROP CONSTRAINT IF EXISTS form2_knowledge_documentation_id_fkey;
ALTER TABLE form2_knowledge_documentation ADD CONSTRAINT form2_knowledge_documentation_id_fkey FOREIGN KEY (id) REFERENCES submissions(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE form2_steps DROP CONSTRAINT IF EXISTS form2_steps_form2_id_fkey;
ALTER TABLE form2_steps ADD CONSTRAINT form2_steps_form2_id_fkey FOREIGN KEY (form2_id) REFERENCES form2_knowledge_documentation(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE form3_quality_assessment DROP CONSTRAINT IF EXISTS form3_quality_assessment_id_fkey;
ALTER TABLE form3_quality_assessment ADD CONSTRAINT form3_quality_assessment_id_fkey FOREIGN KEY (id) REFERENCES submissions(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE form4_lessons_learned DROP CONSTRAINT IF EXISTS form4_lessons_learned_id_fkey;
ALTER TABLE form4_lessons_learned ADD CONSTRAINT form4_lessons_learned_id_fkey FOREIGN KEY (id) REFERENCES submissions(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE form5_strategic_project_plan DROP CONSTRAINT IF EXISTS form5_strategic_project_plan_id_fkey;
ALTER TABLE form5_strategic_project_plan ADD CONSTRAINT form5_strategic_project_plan_id_fkey FOREIGN KEY (id) REFERENCES submissions(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. تحديث الأرقام المرجعية السابقة بالتسلسل الزمني من KM-001 إلى KM-069
UPDATE submissions SET id = 'KM-001' WHERE id = 'KM-911001';
UPDATE submissions SET id = 'KM-002' WHERE id = 'KM-913002';
UPDATE submissions SET id = 'KM-003' WHERE id = 'KM-913003';
UPDATE submissions SET id = 'KM-004' WHERE id = 'KM-915004';
UPDATE submissions SET id = 'KM-005' WHERE id = 'KM-916005';
UPDATE submissions SET id = 'KM-006' WHERE id = 'KM-650806';
UPDATE submissions SET id = 'KM-007' WHERE id = 'KM-833543';
UPDATE submissions SET id = 'KM-008' WHERE id = 'KM-304769';
UPDATE submissions SET id = 'KM-009' WHERE id = 'KM-851246';
UPDATE submissions SET id = 'KM-010' WHERE id = 'KM-642727';
UPDATE submissions SET id = 'KM-011' WHERE id = 'KM-955880';
UPDATE submissions SET id = 'KM-012' WHERE id = 'KM-949397';
UPDATE submissions SET id = 'KM-013' WHERE id = 'KM-672846';
UPDATE submissions SET id = 'KM-014' WHERE id = 'KM-862573';
UPDATE submissions SET id = 'KM-015' WHERE id = 'KM-143233';
UPDATE submissions SET id = 'KM-016' WHERE id = 'KM-457087';
UPDATE submissions SET id = 'KM-017' WHERE id = 'KM-297383';
UPDATE submissions SET id = 'KM-018' WHERE id = 'KM-389269';
UPDATE submissions SET id = 'KM-019' WHERE id = 'KM-220879';
UPDATE submissions SET id = 'KM-020' WHERE id = 'KM-150172';
UPDATE submissions SET id = 'KM-021' WHERE id = 'KM-731970';
UPDATE submissions SET id = 'KM-022' WHERE id = 'KM-302178';
UPDATE submissions SET id = 'KM-023' WHERE id = 'KM-334233';
UPDATE submissions SET id = 'KM-024' WHERE id = 'KM-731091';
UPDATE submissions SET id = 'KM-025' WHERE id = 'KM-721241';
UPDATE submissions SET id = 'KM-026' WHERE id = 'KM-460921';
UPDATE submissions SET id = 'KM-027' WHERE id = 'KM-882719';
UPDATE submissions SET id = 'KM-028' WHERE id = 'KM-400808';
UPDATE submissions SET id = 'KM-029' WHERE id = 'KM-467071';
UPDATE submissions SET id = 'KM-030' WHERE id = 'KM-485152';
UPDATE submissions SET id = 'KM-031' WHERE id = 'KM-619495';
UPDATE submissions SET id = 'KM-032' WHERE id = 'KM-172598';
UPDATE submissions SET id = 'KM-033' WHERE id = 'KM-626905';
UPDATE submissions SET id = 'KM-034' WHERE id = 'KM-805185';
UPDATE submissions SET id = 'KM-035' WHERE id = 'KM-309223';
UPDATE submissions SET id = 'KM-036' WHERE id = 'KM-358296';
UPDATE submissions SET id = 'KM-037' WHERE id = 'KM-732309';
UPDATE submissions SET id = 'KM-038' WHERE id = 'KM-524145';
UPDATE submissions SET id = 'KM-039' WHERE id = 'KM-748988';
UPDATE submissions SET id = 'KM-040' WHERE id = 'KM-716963';
UPDATE submissions SET id = 'KM-041' WHERE id = 'KM-418588';
UPDATE submissions SET id = 'KM-042' WHERE id = 'KM-913006';
UPDATE submissions SET id = 'KM-043' WHERE id = 'KM-950001';
UPDATE submissions SET id = 'KM-044' WHERE id = 'KM-940001';
UPDATE submissions SET id = 'KM-045' WHERE id = 'KM-930001';
UPDATE submissions SET id = 'KM-046' WHERE id = 'KM-913007';
UPDATE submissions SET id = 'KM-047' WHERE id = 'KM-913008';
UPDATE submissions SET id = 'KM-048' WHERE id = 'KM-950002';
UPDATE submissions SET id = 'KM-049' WHERE id = 'KM-586360';
UPDATE submissions SET id = 'KM-050' WHERE id = 'KM-627415';
UPDATE submissions SET id = 'KM-051' WHERE id = 'KM-521350';
UPDATE submissions SET id = 'KM-052' WHERE id = 'KM-749673';
UPDATE submissions SET id = 'KM-053' WHERE id = 'KM-297575';
UPDATE submissions SET id = 'KM-054' WHERE id = 'KM-142067';
UPDATE submissions SET id = 'KM-055' WHERE id = 'KM-825244';
UPDATE submissions SET id = 'KM-056' WHERE id = 'KM-573094';
UPDATE submissions SET id = 'KM-057' WHERE id = 'KM-788983';
UPDATE submissions SET id = 'KM-058' WHERE id = 'KM-748164';
UPDATE submissions SET id = 'KM-059' WHERE id = 'KM-663893';
UPDATE submissions SET id = 'KM-060' WHERE id = 'KM-746366';
UPDATE submissions SET id = 'KM-061' WHERE id = 'KM-648598';
UPDATE submissions SET id = 'KM-062' WHERE id = 'KM-953025';
UPDATE submissions SET id = 'KM-063' WHERE id = 'KM-205174';
UPDATE submissions SET id = 'KM-064' WHERE id = 'KM-476361';
UPDATE submissions SET id = 'KM-065' WHERE id = 'KM-431736';
UPDATE submissions SET id = 'KM-066' WHERE id = 'KM-391959';
UPDATE submissions SET id = 'KM-067' WHERE id = 'KM-585235';
UPDATE submissions SET id = 'KM-068' WHERE id = 'KM-772602';
UPDATE submissions SET id = 'KM-069' WHERE id = 'KM-941520';

-- 3. إضافة سياسات التحديث والحذف للمراجعين المعتمدين لتمكين إدارة وتحديث الطلبات مستقبلاً
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Allow reviewer update of submissions') THEN
    CREATE POLICY "Allow reviewer update of submissions" ON submissions FOR UPDATE TO authenticated USING (is_reviewer());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Allow reviewer delete of submissions') THEN
    CREATE POLICY "Allow reviewer delete of submissions" ON submissions FOR DELETE TO authenticated USING (is_reviewer());
  END IF;
END $$;

COMMIT;
