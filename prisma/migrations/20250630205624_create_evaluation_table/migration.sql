-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseName" TEXT NOT NULL,
    "instructorName" TEXT NOT NULL,
    "personnelAttention" TEXT NOT NULL,
    "questionsReplied" TEXT NOT NULL,
    "certificateDelivery" TEXT NOT NULL,
    "websiteInformation" TEXT NOT NULL,
    "facilities" TEXT NOT NULL,
    "scheduleAppropriate" TEXT NOT NULL,
    "studyMaterial" TEXT NOT NULL,
    "trainingQuality" TEXT NOT NULL,
    "provideFeedback" TEXT NOT NULL,
    "demonstrateExamples" TEXT NOT NULL,
    "encourageParticipation" TEXT NOT NULL,
    "communicateClearly" TEXT NOT NULL,
    "demonstrateKnowledge" TEXT NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);
