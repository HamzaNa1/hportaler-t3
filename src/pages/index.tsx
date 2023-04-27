import { type NextPage } from "next";
import Head from "next/head";

import {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import mainLoop from "~/utils/MainLoop";
import { api } from "~/utils/api";
import { AddConnectionInfo } from "~/utils/loop";
import { ConnectionInfo, ConnectionType } from "~/utils/world";
import zonesGenerator from "~/utils/zones/zones";

const buttonStyle =
  "w-full flex-col items-center outline outline-1 rounded-sm border-black";

const Home: NextPage = () => {
  const [from, updateFrom] = useState<string>("");
  const [to, updateTo] = useState<string>("");
  const [type, updateType] = useState<ConnectionType>("green");
  const [hour, updateHour] = useState<number>(0);
  const [minute, updateMinute] = useState<number>(0);

  let color: string;
  switch (type) {
    case "green":
      color = "bg-green-700";
      break;
    case "blue":
      color = "bg-blue-800";
      break;
    case "yellow":
      color = "bg-yellow-500";
      break;
    case "royal":
      color = "bg-purple-700";
      break;
    default:
      color = "";
      break;
  }

  //   const { data } = api.connections.getAll.useQuery();
  //   const { mutate } = api.connections.create.useMutation();

  //   if (data) {
  //     const infos = [];

  //     for (let connection of data) {
  //       const info: ConnectionInfo = {
  //         id: connection.id,
  //         start: connection.from,
  //         end: connection.to,
  //         type: connection.type as ConnectionType,
  //         endTime: connection.endAt.getTime(),
  //       };

  //       infos.push(info);
  //     }

  //     mainLoop.world.Reload(infos);
  //   }

  const AddConnection = () => {
    let connectionInfo: AddConnectionInfo = {
      from: from,
      to: to,
      type: type,
      h: hour,
      m: minute,
    };

    let connection = mainLoop.addConnection(connectionInfo);
    if (!connection) {
      return;
    }

    updateTo("");
    updateHour(0);
    updateMinute(0);

    mainLoop.randomizePositions();
  };

  return (
    <>
      <Head>
        <title>HPortaler</title>
        <meta name="description" content="HPortaler" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen bg-slate-700 text-white">
        <div className="flex h-full w-[220px] flex-col gap-5 bg-slate-800 p-4 shadow-black drop-shadow-xl">
          <AutoCompleteInput
            placeholder="From"
            value={from}
            setValue={updateFrom}
          />
          <AutoCompleteInput placeholder="To" value={to} setValue={updateTo} />
          <div className="flex flex-row gap-3">
            <button
              className={
                buttonStyle +
                " bg-green-700 shadow-black outline outline-1 outline-amber-100 active:bg-green-800"
              }
              onClick={() => updateType("green")}
            >
              2
            </button>
            <button
              className={
                buttonStyle +
                " bg-blue-800 outline outline-1 outline-amber-100 active:bg-blue-900"
              }
              onClick={() => updateType("blue")}
            >
              7
            </button>
            <button
              className={
                buttonStyle +
                " bg-yellow-500 outline outline-1 outline-amber-100 active:bg-yellow-600"
              }
              onClick={() => updateType("yellow")}
            >
              20
            </button>
            <button
              className={
                buttonStyle +
                " bg-purple-700 outline outline-1 outline-amber-100 active:bg-purple-800"
              }
              onClick={() => updateType("royal")}
            >
              R
            </button>
          </div>
          <button
            className={
              color +
              " h-3 w-full cursor-default outline outline-1 outline-amber-100"
            }
          ></button>
          <div className="flex flex-row gap-5">
            <div className="w-full flex-col">
              <div>h</div>
              <input
                className="w-full rounded-sm bg-amber-500 outline outline-1 outline-amber-100"
                type="number"
                value={hour}
                min={0}
                max={24}
                onInput={(e) => {
                  updateHour(parseInt((e.target as HTMLInputElement).value));
                }}
              />
            </div>
            <div className="w-full flex-col">
              <div>m</div>
              <input
                className="w-full rounded-sm bg-amber-500 outline outline-1 outline-amber-100"
                type="number"
                value={minute}
                min={0}
                max={60}
                onInput={(e) => {
                  updateMinute(parseInt((e.target as HTMLInputElement).value));
                }}
              />
            </div>
          </div>
          <button
            className="rounded-lg border border-amber-100 bg-amber-600 hover:bg-amber-500 active:bg-amber-700"
            onClick={AddConnection}
          >
            Add
          </button>
          <button
            className="rounded-lg border border-amber-100 bg-amber-600 hover:bg-amber-500 active:bg-amber-700"
            onClick={() => mainLoop.deleteSelected()}
          >
            Delete
          </button>
          <button
            className="rounded-lg border border-amber-100 bg-amber-600 hover:bg-amber-500 active:bg-amber-700"
            onClick={() => mainLoop.randomizePositions()}
          >
            Randomize
          </button>
        </div>
        <div className="flex h-full w-full flex-col ">
          <Canvas></Canvas>
        </div>
      </main>
    </>
  );
};

export default Home;

const Canvas: React.FC = () => {
  const { data: connections, isLoading } = api.connections.getAll.useQuery();

  useEffect(() => {
    if (!connections) {
      return;
    }

    const infos = [];

    for (let connection of connections) {
      const info: ConnectionInfo = {
        id: connection.id,
        start: connection.from,
        end: connection.to,
        type: connection.type as ConnectionType,
        endTime: connection.endAt.getTime(),
      };

      infos.push(info);
    }

    mainLoop.world.Reload(infos);
  }, [connections?.length]);

  const onResize = () => {
    if (!canvas.current) {
      return;
    }

    let width = window.innerWidth - 213;
    let height = window.innerHeight;

    canvas.current.width = width;
    canvas.current.height = height;
    canvas.current.style.width = width + "px";
    canvas.current.style.height = height + "px";

    mainLoop.onResize(width, height);
  };

  const onMouseDown = (e: MouseEvent) => {
    mainLoop.onMouseDown(e.button);
  };

  const onMouseUp = (e: MouseEvent) => {
    mainLoop.onMouseUp(e.button);
  };

  const onMouseMove = (e: MouseEvent) => {
    mainLoop.onMouseMove(e.clientX, e.clientY);
  };

  let canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();
    mainLoop.update();

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const tick = () => {
    if (!canvas.current) {
      return;
    }

    mainLoop.gameLoop(canvas.current.getContext("2d")!);
    requestAnimationFrame(tick);
  };

  useEffect(() => {
    requestAnimationFrame(tick);
  }, []);

  return (
    <canvas
      ref={canvas}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    ></canvas>
  );
};

const AutoCompleteInput: React.FC<{
  placeholder: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}> = ({ placeholder, value, setValue }) => {
  let [isFocused, focusUpdate] = useState<boolean>(false);

  const onChange = (event: ChangeEvent) => {
    let input: HTMLInputElement = event.target as HTMLInputElement;
    setValue(input.value);
  };

  const onFocus = () => focusUpdate(true);
  const onBlur = () => focusUpdate(false);
  const onClick = (zone: string) => {
    setValue(zone);
  };

  let zones = zonesGenerator.FindZone(value);

  return (
    <>
      <div className="flex flex-row">
        <div className="!z-1 relative flex-row">
          <div>{placeholder}</div>

          <div className="relative  w-full">
            <input
              value={value}
              className="rounded-sm bg-amber-500 outline outline-1 outline-amber-100"
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
            ></input>
          </div>
          <div className="!z-100 absolute flex-row">
            {isFocused && (
              <div className="relative">
                {zones.length > 0 &&
                  zones.map((zone) => (
                    <button
                      key={zone}
                      className="float-left w-full bg-amber-600 hover:bg-amber-700"
                      onMouseDown={() => onClick(zone)}
                    >
                      {zone}
                    </button>
                  ))}
                {zones.length == 0 && (
                  <button className="float-left w-full bg-amber-600">
                    No Items Available
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
