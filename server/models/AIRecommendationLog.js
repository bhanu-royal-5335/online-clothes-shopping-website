const mongoose = require('mongoose');

const aiRecommendationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tenantId: {
      type: String,
      default: 'default-tenant',
      index: true,
    },
    analysisType: {
      type: String,
      enum: ['image_analysis', 'outfit_generation', 'natural_search', 'size_estimation'],
      required: true,
    },
    detectedTraits: {
      bodyType: { type: String },
      skinTone: { type: String },
      hairColor: { type: String },
      detectedStyle: { type: String },
      primaryColors: [{ type: String }],
    },
    occasion: {
      type: String,
      default: 'Casual',
    },
    weather: {
      temp: { type: Number },
      condition: { type: String },
    },
    recommendedProductIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    naturalQuery: {
      type: String,
    },
    userFeedback: {
      type: String,
      enum: ['liked', 'disliked', 'purchased', 'none'],
      default: 'none',
    },
  },
  {
    timestamps: true,
  }
);

aiRecommendationLogSchema.index({ createdAt: -1 });
aiRecommendationLogSchema.index({ 'detectedTraits.skinTone': 1, 'detectedTraits.bodyType': 1 });

const AIRecommendationLog = mongoose.model('AIRecommendationLog', aiRecommendationLogSchema);
module.exports = AIRecommendationLog;
