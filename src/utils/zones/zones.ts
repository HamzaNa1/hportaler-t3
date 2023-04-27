class ZonesGenerator {
  loaded: boolean;
  zones: ZoneInfo[];
  zoneNames: string[];

  constructor() {
    this.loaded = false;
    this.zones = [];
    this.zoneNames = [];

    console.log("A");
  }

  public FindZone(zoneName: string): string[] {
    if (!this.loaded) {
      return [];
    }

    let zones = [];
    for (let zone of this.zones) {
      let index = zone.name.toLowerCase().indexOf(zoneName.toLowerCase());
      if (index != -1) {
        zones.push({ name: zone.name, index: index });
      }
    }

    return zones
      .sort(this.compare)
      .map((nameIndex) => nameIndex.name)
      .slice(0, 10);
  }

  private compare(zoneName1: any, zoneName2: any) {
    if (zoneName1.index > zoneName2.index) {
      return 1;
    } else if (zoneName1.index < zoneName2.index) {
      return -1;
    }

    return 0;
  }

  public GetZone(zoneName: string): ZoneInfo | null {
    if (!this.loaded) {
      return null;
    }

    let zone = this.zones.find((x) => x.name == zoneName);

    if (zone) {
      return zone;
    }

    return null;
  }

  public async SetupZones(): Promise<void> {
    this.zones = [];
    // this.zones = [
    //   {
    //     id: 0,
    //     albionId: "0",
    //     name: "Arthur's Rest",
    //     tier: "1",
    //     color: "blue",
    //     type: "",
    //     isDeep: false,
    //   },
    //   {
    //     id: 0,
    //     albionId: "0",
    //     name: "Martlock",
    //     tier: "1",
    //     color: "blue",
    //     type: "",
    //     isDeep: false,
    //   },
    // ];
    this.zones = (await this.fetchZonesJson()).filter((x) => x.color != " ");
    this.zoneNames = this.zones.map((x) => x.name);

    this.loaded = true;
  }

  private async fetchZonesJson(): Promise<ZoneInfo[]> {
    const url =
      "https://raw.githubusercontent.com/HamzaNa1/data-dump/main/zones.json";

    return await (await fetch(url)).json();
  }
}

export interface ZoneInfo {
  id: number;
  albionId: string;
  name: string;
  tier: string;
  color: string;
  type: string;
  isDeep: boolean;
}

const zoneGenerator = new ZonesGenerator();
zoneGenerator.SetupZones();

export default zoneGenerator;
