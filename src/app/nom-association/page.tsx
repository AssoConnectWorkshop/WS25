import NomAssociationForm from "./NomAssociationForm";

export const metadata = {
  title: "Nommez votre association",
  description: "Générez des idées de noms pour votre association française grâce à l'IA.",
};

export default function NomAssociationPage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 p-8 pt-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-bold">Nommez votre association</h1>
        <p className="text-gray-500 max-w-lg">
          Décrivez votre projet associatif et laissez l&apos;IA vous proposer des noms originaux et adaptés.
        </p>
      </div>
      <NomAssociationForm />
    </main>
  );
}
