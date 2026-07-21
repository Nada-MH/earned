export interface RAGDomainCriteria {
  roleCategory: string;
  keyTechnicalExpectations: string[];
  architecturalPatterns: string[];
  quantitativeMetricsToLookFor: string[];
  commonAntiPatterns: string[];
  referenceStandardSummary: string;
}

const RAG_DOMAIN_REPOSITORY: Record<string, RAGDomainCriteria> = {
  'software': {
    roleCategory: 'Software Engineering & Development',
    keyTechnicalExpectations: [
      'Clean modular code separation (DRY, SOLID principles)',
      'Asynchronous flow handling, promise resolution, error boundaries',
      'Data structure selection and time/space complexity optimization'
    ],
    architecturalPatterns: [
      'Microservices vs Monolith trade-off awareness',
      'Caching layers (Redis, CDN), database indexing, API rate limiting',
      'Event-driven messaging (Kafka, RabbitMQ, WebSockets)'
    ],
    quantitativeMetricsToLookFor: [
      'Latency metrics (p95/p99 response times in ms)',
      'Throughput (QPS, TPS), database query count reduction',
      'Test coverage percentage and build/deployment pipelines'
    ],
    commonAntiPatterns: [
      'Vague hand-waving without code snippets or specific algorithms',
      'Ignoring error states, race conditions, or unhandled promise rejections',
      'Hardcoded values or monolithic single-file functions'
    ],
    referenceStandardSummary: 'ISO/IEC 25010 Software Quality Standard & Production Readiness Benchmark'
  },
  'data': {
    roleCategory: 'Data Science & Machine Learning',
    keyTechnicalExpectations: [
      'Data cleaning, feature engineering, missing value imputation',
      'Model architecture selection (XGBoost, Transformers, Neural Nets)',
      'Overfitting mitigation, cross-validation, hyperparameter tuning'
    ],
    architecturalPatterns: [
      'Batch vs Streaming data pipelines (Spark, Flink, Airflow)',
      'Model deployment (Triton, ONNX, FastAPI) & feature store integration',
      'Data drift monitoring & continuous model retraining'
    ],
    quantitativeMetricsToLookFor: [
      'Precision, Recall, F1-Score, ROC-AUC, RMSE metrics',
      'Inference latency (ms per sample), GPU memory utilization',
      'Dataset volume (GB/TB processed), data drift thresholds'
    ],
    commonAntiPatterns: [
      'Data leakage from test set to training set',
      'Optimizing accuracy alone on imbalanced datasets',
      'No evaluation of inference speed or model deployment costs'
    ],
    referenceStandardSummary: 'Google MLOps Maturity Model & Production ML Quality Guidelines'
  },
  'product': {
    roleCategory: 'Product Management & Design',
    keyTechnicalExpectations: [
      'User problem definition & customer persona validation',
      'Feature prioritization matrix (RICE, Eisenhower, MoSCoW)',
      'Cross-functional alignment with engineering, design, and executive stakeholders'
    ],
    architecturalPatterns: [
      'Product analytics tracking (Mixpanel, Amplitude, Segment)',
      'A/B testing experimentation frameworks & statistical significance',
      'Iterative MVP launching & feedback loop design'
    ],
    quantitativeMetricsToLookFor: [
      'North Star Metrics (DAU/MAU, LTV, CAC, Retention cohort %)',
      'Conversion funnel drop-off rates and Net Promoter Score (NPS)',
      'Feature adoption rates and time-to-value (TTV)'
    ],
    commonAntiPatterns: [
      'Building feature bloat without user research evidence',
      'Lacking quantitative success criteria for launched features',
      'Ignoring technical debt constraints communicated by engineering'
    ],
    referenceStandardSummary: 'SVPG (Silicon Valley Product Group) Product Management Excellence Framework'
  },
  'general': {
    roleCategory: 'General Technical & Professional Role',
    keyTechnicalExpectations: [
      'Structured step-by-step problem decomposition',
      'Clear domain knowledge application with terminology correctness',
      'Systematic execution plan with actionable deliverables'
    ],
    architecturalPatterns: [
      'Process scalability, resource allocation, and risk management',
      'Quality assurance standards and protocol enforcement'
    ],
    quantitativeMetricsToLookFor: [
      'Specific percentages, throughput rates, cost reductions, or timeline savings',
      'Verifiable KPIs and outcome benchmarks'
    ],
    commonAntiPatterns: [
      'Generic surface-level answers without actionable steps',
      'Missing explanations of why choices were made'
    ],
    referenceStandardSummary: 'Standard Technical & Professional Benchmark Criteria'
  }
};

/**
 * Retrieve domain reference benchmarks based on candidate role / major
 */
export function retrieveRAGCriteria(role: string): RAGDomainCriteria {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole.includes('data') || normalizedRole.includes('machine') || normalizedRole.includes('ai') || normalizedRole.includes('ml')) {
    return RAG_DOMAIN_REPOSITORY['data'];
  }
  if (normalizedRole.includes('product') || normalizedRole.includes('design') || normalizedRole.includes('ux') || normalizedRole.includes('manager')) {
    return RAG_DOMAIN_REPOSITORY['product'];
  }
  if (normalizedRole.includes('soft') || normalizedRole.includes('developer') || normalizedRole.includes('engineer') || normalizedRole.includes('code') || normalizedRole.includes('stack')) {
    return RAG_DOMAIN_REPOSITORY['software'];
  }

  return RAG_DOMAIN_REPOSITORY['general'];
}
