import { ConnectionType, World } from "./world";
import type { Ball, Connection } from "./world";
import type { ZoneInfo } from "./zones/zones";
import zonesGenerator from "./zones/zones";

export default class Loop {
  world: World;
  selectedBall: Ball | null;

  mouse: Mouse;

  //   homeImage: HTMLImageElement;
  //   blackzoneHomeImage: HTMLImageElement;

  scale: number;

  constructor() {
    console.log("Created loop");

    this.world = new World();
    this.selectedBall = null;

    this.scale = 1;

    this.mouse = {
      x: 0,
      y: 0,
      buttons: [false, false],
    };
  }

  public changeScale(newScale: number) {
    if (newScale <= 0) {
      return;
    }

    this.scale = newScale;
  }

  public addConnection(info: AddConnectionInfo): Connection | undefined {
    if (info.from == "" || info.to == "") {
      return undefined;
    }

    if (info.type == "royal") {
      info.h = 24;
      info.m = 0;
    }

    if (info.h == 0 && info.m == 0) {
      return undefined;
    }

    let from = zonesGenerator.GetZone(info.from);
    let to = zonesGenerator.GetZone(info.to);

    if (from == null || to == null) {
      return undefined;
    }

    const date = new Date();
    let endTime = (info.h * 60 + info.m) * 60000 + date.getTime();

    return this.world.AddConnection(from, to, info.type, endTime);
  }

  public deleteSelected() {
    if (this.selectedBall == null) {
      return;
    }

    this.world.DeleteBall(this.selectedBall);
  }

  public randomizePositions() {
    this.world.SortAll();
  }

  public onMouseDown(button: number) {
    if (button === 0) {
      this.mouse.buttons[0] = true;
      this.selectedBall = this.world.GetBallAt(this.mouse.x, this.mouse.y);
      if (this.selectedBall != null) {
        // this.sidebar.SetFrom(this.selectedBall.zone.name);
      }
    } else if (button === 2) {
      this.mouse.buttons[1] = true;
    }
  }

  public onMouseUp(button: number) {
    if (button === 0) {
      this.mouse.buttons[0] = false;
    } else if (button === 2) {
      this.mouse.buttons[1] = false;
    }
  }

  public onMouseMove(x: number, y: number) {
    this.mouse.x = x - 220 - this.world.screenSize.x / 2;
    this.mouse.y = y - this.world.screenSize.y / 2;
  }

  public onResize(width: number, height: number) {
    this.world.screenSize = {
      x: width,
      y: height,
    };
  }

  public gameLoop(ctx: CanvasRenderingContext2D) {
    this.update();
    this.draw(ctx);
  }

  public update() {
    if (this.selectedBall && this.mouse.buttons[0]) {
      this.selectedBall.x = this.mouse.x;
      this.selectedBall.y = this.mouse.y;
    }

    this.world.CheckConnections();
  }

  public draw(ctx: CanvasRenderingContext2D) {
    this.clear(ctx);

    this.world.connections.forEach((connection) => {
      this.drawConnection(ctx, connection);
    });

    this.world.balls.forEach((ball) => {
      this.drawBall(ctx, ball);
    });
  }

  //   intersect() {
  //     let c1 = this.world.connections[0];
  //     let c2 = this.world.connections[1];

  //     alert(this.world.Intersect(c1, c2));
  //   }

  private clear(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, this.world.screenSize.x, this.world.screenSize.y);
    ctx.closePath();
  }

  private drawConnection(
    ctx: CanvasRenderingContext2D,
    connection: Connection
  ) {
    let x1 = connection.start.x + this.world.screenSize.x / 2;
    let y1 = connection.start.y + this.world.screenSize.y / 2;
    let x2 = connection.end.x + this.world.screenSize.x / 2;
    let y2 = connection.end.y + this.world.screenSize.y / 2;

    this.drawLine(ctx, x1, y1, x2, y2, this.connectionToColor(connection));

    if (connection.type != "royal") {
      this.drawText(
        ctx,
        (x1 + x2) / 2,
        (y1 + y2) / 2,
        this.getTimeLeft(connection),
        "white"
      );
    }
  }

  private drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
    let x = ball.x + this.world.screenSize.x / 2;
    let y = ball.y + this.world.screenSize.y / 2;

    this.drawCircleFill(
      ctx,
      x,
      y,
      ball.radius * this.scale,
      this.zoneToColor(ball.zone)
    );
    this.drawText(ctx, x, y, ball.zone.tier, "white");

    if (ball == this.selectedBall) {
      this.drawCircle(ctx, x, y, ball.radius * this.scale, 1.25, "white");
    } else {
      this.drawCircle(ctx, x, y, ball.radius * this.scale, 0.33, "black");
    }

    this.drawText(
      ctx,
      x,
      y + ball.radius * this.scale * 2,
      ball.zone.name,
      "white"
    );
  }

  private drawCircleFill(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string
  ) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  private drawCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    lineWidth: number,
    color: string
  ) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  private drawLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string
  ) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  private drawText(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    color: string
  ) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.fillStyle = color;
    let fontSize = 12 * this.scale;
    ctx.font = "bold " + fontSize + "px Arial";
    let metrics = ctx.measureText(text);
    x -= metrics.width / 2;
    y +=
      (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2;

    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  }

  private drawImage(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    image: CanvasImageSource
  ) {
    ctx.beginPath();
    ctx.drawImage(
      image,
      x - 20 * this.scale,
      y - 20 * this.scale,
      40 * this.scale,
      40 * this.scale
    );
  }

  private connectionToColor(connection: Connection): string {
    switch (connection.type) {
      case "green":
        return "rgb(0, 128, 0)";
      case "blue":
        return "rgb(0, 0, 255)";
      case "yellow":
        return "rgb(214, 157, 0)";
      case "royal":
        return "black";
      default:
        return "";
    }
  }

  private zoneToColor(zone: ZoneInfo): string {
    switch (zone.color) {
      case "blue":
      case "city":
        return "rgb(100, 149, 237)";
      case "red":
        return "rgb(219, 112, 147)";
      case "yellow":
        return "rgb(218, 165, 32)";
      case "black":
        return "black";
      case "road":
        return "rgb(64, 224, 208)";
      case "road-ho":
        return "rgb(102, 51, 153)";
      default:
        return "";
    }
  }

  private getTimeLeft(connection: Connection): string {
    const date = new Date();
    let time = connection.endTime - date.getTime() + 60000;

    let hours = time / 3600000;
    let mintues = (hours - Math.floor(hours)) * 60;

    return Math.floor(hours) + "h " + Math.floor(mintues) + "m";
  }
}

interface Mouse {
  x: number;
  y: number;
  buttons: boolean[];
}

export interface AddConnectionInfo {
  from: string;
  to: string;
  type: ConnectionType;
  h: number;
  m: number;
}
