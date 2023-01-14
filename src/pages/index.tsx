import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import VoronoiDiagram from "../components/Voronoi";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { generateDataVoronoiMap } from "../utils/generateDatum";

export interface IQuestion {
  questionId: string;
  answer: string;
}
export type IResponse = IQuestion[];

function min(a: number, b: number) {
  return a < b ? a : b;
}

const Home: NextPage = () => {
  const { data, error, isLoading } = useQuery<IResponse[]>(
    "getAllResponses",
    async () => {
      const allResponses = await fetch("/api/getallresponses").then(
        (res) => res.json() as Promise<IResponse[]>
      );
      return allResponses as IResponse[];
    }
  );
  const { height, width } = useWindowDimensions();

  const generatedDataVoronoiMap = useMemo(() => {
    if (data) return generateDataVoronoiMap(data);
  }, [data]);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <>
      <Head>
        <title>Wat zou jij op een billboard zetten?</title>
        <meta name="description" content="Gemaakt met ❤️ door Arian Joyandeh" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <h1 className="text-xl font-bold text-white lg:text-4xl">
          Wat zou jij op een billboard zetten?
        </h1>
        <p>
          <a href="https://forms.gle/MjjQVo3JgRHBzsjx5">
            <a className="text-white hover:text-violet-400">
              Spreekt voor zich. Vul deze form in om te delen wat jij denkt!
            </a>
          </a>
        </p>
        {generatedDataVoronoiMap && (
          <VoronoiDiagram
            data={generatedDataVoronoiMap}
            width={min(width - 50, 1000)}
            height={600}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          />
        )}
        <div className="text-slate-100">Gemaakt met ❤️ door Arian Joyandeh</div>
      </main>
    </>
  );
};

export default Home;
