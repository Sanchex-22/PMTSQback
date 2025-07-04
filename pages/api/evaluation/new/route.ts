// app/api/evaluation/new/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import cors from '../../../../lib/cors-middleware';

const prisma = new PrismaClient();

export async function POST(req: Request, res: Response) {
  try {
    await cors(req,res);
    // FormData se puede leer directamente del objeto request en Next.js App Router
    const formData = await req.formData();

    // Extraer los datos y validarlos
    const courseName = formData.get("courseName") as string;
    const instructorName = formData.get("instructorName") as string;
    const personnelAttention = formData.get("personnelAttention") as string;
    const questionsReplied = formData.get("questionsReplied") as string; // ¡Asegúrate de que este campo exista en el formulario!
    const certificateDelivery = formData.get("certificateDelivery") as string;
    const websiteInformation = formData.get("websiteInformation") as string;
    const facilities = formData.get("facilities") as string;
    const scheduleAppropriate = formData.get("scheduleAppropriate") as string;
    const studyMaterial = formData.get("studyMaterial") as string;
    const trainingQuality = formData.get("trainingQuality") as string;
    const provideFeedback = formData.get("provideFeedback") as string;
    const demonstrateExamples = formData.get("demonstrateExamples") as string;
    const encourageParticipation = formData.get("encourageParticipation") as string;
    const communicateClearly = formData.get("communicateClearly") as string;
    const demonstrateKnowledge = formData.get("demonstrateKnowledge") as string;

    // Validación básica en el servidor
    // Puedes hacer una validación más robusta aquí si es necesario (ej. Zod)
    if (
      !courseName ||
      !instructorName ||
      !personnelAttention ||
      !questionsReplied || // Incluido aquí también
      !certificateDelivery ||
      !websiteInformation ||
      !facilities ||
      !scheduleAppropriate ||
      !studyMaterial ||
      !trainingQuality ||
      !provideFeedback ||
      !demonstrateExamples ||
      !encourageParticipation ||
      !communicateClearly ||
      !demonstrateKnowledge
    ) {
      return NextResponse.json(
        { message: "Faltan uno o más campos requeridos." },
        { status: 400 }
      );
    }

    // Crear la entrada en la base de datos
    const newEvaluation = await prisma.evaluation.create({
      data: {
        courseName,
        instructorName,
        personnelAttention,
        questionsReplied,
        certificateDelivery,
        websiteInformation,
        facilities,
        scheduleAppropriate,
        studyMaterial,
        trainingQuality,
        provideFeedback,
        demonstrateExamples,
        encourageParticipation,
        communicateClearly,
        demonstrateKnowledge,
      },
    });

    return NextResponse.json(
      { message: "Evaluación guardada con éxito", evaluation: newEvaluation },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error al procesar la evaluación:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al guardar la evaluación." },
      { status: 500 }
    );
  }
}