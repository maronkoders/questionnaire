import mongoose from 'mongoose';

const personalInfoSchema = new mongoose.Schema({
    cpa_member: String,
    gender: String,
    legacy_designation: Array,
    languages: Array,
    industry_type: String,
    current_position: String,
    work_nature: String,
    job_title: String,
    birth_year: String,
    staff_number: String,
    oversee_number: String,
    primary_cpa_body: String,
    yearly_compensation: String,
    years_since_designation: String
});

const careerSatisfactionSchema = new mongoose.Schema({
    career_success: Number,
    career_progress_overall: Number,
    career_progress_income: Number,
    career_progress_advancement: Number,
    career_progress_skills: Number,
    career_progress_work_life: Number,
    career_thoughts: String,
});

const emotionalIntelligenceSchema = new mongoose.Schema({
    emotional_awareness_1: Number,
    emotional_expression_2: Number,
    colleague_satisfaction_3: Number,
    problem_solving_4: Number,
    criticism_5: Number,
    positive_environment_6: Number,
    enthusiasm_7: Number,
    negative_awareness_8: Number,
    motivation_difficulty_9: Number,
    considered_feelings_10: Number,
    wrong_people_11: Number,
    fail_cooperate_12: Number,
    motivate_others_13: Number,
    remain_focused_14: Number,
    feelings_influence_15: Number,
    positive_emotions_16: Number,
    fail_identify_response_17: Number,
    consider_organization_values_18: Number,
    engage_positive_19: Number,
    demonstrate_empathy_20: Number,
    inappropriate_behavior_21: Number,
    body_language_22: Number,
    appropriate_time_23: Number,
    understand_engagement_24: Number,
    consider_own_feelings_25: Number,
    ruminate_26: Number,
    help_others_positive_27: Number,
    demonstrate_excitement_28: Number,
    mood_state_29: Number,
    under_stress_impulsive_30: Number,
    understand_feelings_31: Number,
    communicate_decisions_32: Number,
    deal_annoyances_33: Number,
    help_respond_effectively_34: Number,
    fail_control_temper_35: Number,
    tone_of_voice_36: Number,
    positive_feedback_37: Number,
    fail_recognize_emotions_38: Number,
    stakeholder_commitment_39: Number,
    appropriate_response_40: Number,
    help_colleagues_41: Number,
    hold_back_reaction_42: Number,
    fail_recognize_feelings_43: Number,
    express_happiness_44: Number,
    nonverbal_cues_45: Number,
    communicate_decisions_46: Number,
    positive_moods_47: Number,
    help_frustration_48: Number,
    impatient_49: Number,
    feelings_influence_50: Number,
    express_upset_51: Number,
    understand_optimistic_52: Number,
    consider_reactions_53: Number,
    adjust_conditions_54: Number,
    colleagues_upset_55: Number,
    think_clearly_56: Number,
    identify_feelings_57: Number,
    express_optimism_58: Number,
    understand_valued_59: Number,
    technical_feelings_60: Number,
    handle_stress_61: Number,
    respond_frustration_62: Number,
    positive_awareness_63: Number,
    resolve_emotions_64: Number,
    express_feelings_65: Number,
    identify_feelings_66: Number,
    technical_focus_67: Number,
    keep_calm_68: Number,
    explore_causes_69: Number,
    discuss_frustration_70: Number
});

// const scoring = new mongoose.Schema({
//     reverseScore:Number,
//     emotionalSelfAwarebess: Number,
//     emotionalExpression:Number,
//     emotionalAwarenessOfOthers:Number,
//     emotionalReasoning:Number,
//     emotionalSelfManagement:Number,
//     emotionalManagementOfOthers:Number,
//     emotionalSelfControl:Number,
//     totalEmotionalIntelligence:Number,

// });

const assessmentSchema = new mongoose.Schema({
    personal_info: personalInfoSchema,
    career_satisfaction: careerSatisfactionSchema,
    emotional_intelligence: emotionalIntelligenceSchema,
    created_at: { type: Date, default: Date.now },
    deviceFingerprint: { type: String, required: true, index: true },
    ipAddress: { type: String, required: true },
    lastSubmission: { type: Date }
});

assessmentSchema.index({ deviceFingerprint: 1, ipAddress: 1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment; 