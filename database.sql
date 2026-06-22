-- مخطط قاعدة البيانات لمنصة إدارة المعرفة التفاعلية
-- قواعد البيانات المستهدفة: PostgreSQL / MySQL / SQLite
-- الترميز: UTF-8

CREATE TABLE submissions (
    id VARCHAR(50) PRIMARY KEY,
    form_type VARCHAR(20) NOT NULL, -- 'form1', 'form2', 'form3', 'form4', 'form5'
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- النموذج 1: نموذج حصر المعرفة والعمليات الحرجة
CREATE TABLE form1_critical_processes (
    id VARCHAR(50) PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
    department_name VARCHAR(150) NOT NULL, -- اسم الإدارة / القسم
    process_name VARCHAR(200) NOT NULL, -- اسم العملية الحرجة
    knowledge_type VARCHAR(50) CHECK (knowledge_type IN ('implicit', 'explicit')), -- نوع المعرفة (ضمنية/صريحة)
    knowledge_owner_name VARCHAR(150), -- اسم مالك المعرفة / الخبير
    knowledge_owner_job VARCHAR(150), -- وظيفة مالك المعرفة
    storage_location VARCHAR(250), -- مكان التخزين الحالي
    risk_level VARCHAR(30) CHECK (risk_level IN ('very_high', 'medium', 'low')), -- مستوى الأهمية / المخاطرة
    documentation_status VARCHAR(50) CHECK (documentation_status IN ('undocumented', 'partially_documented', 'documented_approved')), -- حالة التوثيق الحالية
    team_notes TEXT -- ملاحظات فريق الحصر
);

-- النموذج 2: قالب توثيق المعرفة / الإجراءات التشغيلية
CREATE TABLE form2_knowledge_documentation (
    id VARCHAR(50) PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
    knowledge_title VARCHAR(250) NOT NULL, -- عنوان المعرفة / الإجراء
    reference_code VARCHAR(100), -- الرقم المرجعي / الكود
    owning_department VARCHAR(150) NOT NULL, -- الإدارة المالكة
    expert_name VARCHAR(150) NOT NULL, -- الخبير المعتمد للمحتوى
    expert_signature VARCHAR(250), -- التوقيع المعتمد (نصي أو رابط الصورة)
    expert_date DATE, -- تاريخ التوقيع
    objective TEXT, -- الهدف
    application_scope TEXT, -- نطاق التطبيق
    input_requirements TEXT, -- المتطلبات المدخلة
    associated_tools TEXT, -- الأدوات والنماذج المرتبطة
    expert_tips TEXT, -- نصائح الخبراء والأخطاء الشائعة
    next_review_date DATE -- تاريخ المراجعة القادم
);

-- خطوات النموذج 2 (علاقة رأس بأطراف للخطوات الإجرائية)
CREATE TABLE form2_steps (
    id SERIAL PRIMARY KEY,
    form2_id VARCHAR(50) REFERENCES form2_knowledge_documentation(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    step_details TEXT NOT NULL
);

-- النموذج 3: بطاقة تقييم جودة المعرفة
CREATE TABLE form3_quality_assessment (
    id VARCHAR(50) PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
    asset_name VARCHAR(250) NOT NULL, -- اسم الأصل المعرفي
    assessor_name VARCHAR(150) NOT NULL, -- اسم المقيم
    assessment_date DATE NOT NULL, -- تاريخ التقييم
    accuracy_score INT CHECK (accuracy_score BETWEEN 1 AND 5), -- الدقة
    completeness_score INT CHECK (completeness_score BETWEEN 1 AND 5), -- الاكتمال
    clarity_score INT CHECK (clarity_score BETWEEN 1 AND 5), -- الوضوح
    recency_score INT CHECK (recency_score BETWEEN 1 AND 5), -- الحداثة
    accessibility_score INT CHECK (accessibility_score BETWEEN 1 AND 5), -- سهولة الوصول والتصنيف
    total_score INT CHECK (total_score BETWEEN 5 AND 25), -- مجموع الدرجات
    accreditation_decision VARCHAR(50) CHECK (accreditation_decision IN ('approved_publish', 'approved_conditions', 'rejected')), -- قرار الاعتماد
    assessor_notes TEXT -- ملاحظات المقيم
);

-- النموذج 4: نموذج حصر الدروس المستفادة والتوصيات
CREATE TABLE form4_lessons_learned (
    id VARCHAR(50) PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
    project_name VARCHAR(250) NOT NULL, -- اسم المشروع / العملية
    closure_date DATE, -- تاريخ الإغلاق
    team_leader VARCHAR(150), -- قائد الفريق / مدير المشروع
    planned_goals TEXT, -- ما كان مخططاً له؟ (الأهداف الأصلية)
    actual_results TEXT, -- ما الذي حدث فعلياً؟ (النتائج الفعلية)
    root_cause_difference TEXT, -- لماذا حدث هذا الفرق؟ (جذور السبب)
    lesson_learned TEXT, -- الدرس المستفاد
    future_recommendation TEXT, -- التوصية الإجرائية للمستقبل
    recommendation_owner VARCHAR(150), -- من سيتبنى تطبيق هذه التوصية؟
    closure_status VARCHAR(50) CHECK (closure_status IN ('saved_repository', 'under_followup')) -- حالة الإغلاق
);

-- النموذج 5: خطة مشروع توثيق المعرفة الاستراتيجية
CREATE TABLE form5_strategic_project_plan (
    id VARCHAR(50) PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
    project_name VARCHAR(250) NOT NULL, -- اسم المشروع المعرفي
    project_manager VARCHAR(150) NOT NULL, -- مدير المشروع
    expected_start_date DATE, -- تاريخ البدء المتوقع
    target_end_date DATE, -- تاريخ الانتهاء المستهدف
    expected_outputs TEXT, -- الأهداف والمخرجات المتوقعة
    requirements_analysis_date DATE, -- تاريخ تحليل المتطلبات
    development_automation_date DATE, -- تاريخ التطوير / الأتمتة
    beta_testing_date DATE, -- تاريخ الاختبار التجريبي
    launch_training_date DATE, -- تاريخ الإطلاق والتدريب
    required_resources TEXT, -- الموارد المطلوبة
    expected_risks TEXT, -- المخاطر والمعوقات المتوقعة
    current_progress_percentage INT CHECK (current_progress_percentage BETWEEN 0 AND 100), -- نسبة الإنجاز الحالية
    project_status VARCHAR(30) CHECK (project_status IN ('green', 'yellow', 'red')) -- حالة المشروع (أخضر/أصفر/أحمر)
);

-- فهارس لتحسين سرعة البحث والاستعلام في لوحة الإدارة
CREATE INDEX idx_submissions_type ON submissions(form_type);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created ON submissions(created_at);
