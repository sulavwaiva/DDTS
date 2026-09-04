import { useEffect, useRef } from "react";
import NepalMap from "./NepalMap";

import provinceData from "./data/nepal-province";
import province_1 from "./data/province1-district";
import province_2 from "./data/province2-district";
import province_3 from "./data/province3-district";
import province_4 from "./data/province4-district";
import province_5 from "./data/province5-district";
import province_6 from "./data/province6-district";
import province_7 from "./data/province7-district";

const districtData = {
  1: province_1,
  2: province_2,
  3: province_3,
  4: province_4,
  5: province_5,
  6: province_6,
  7: province_7,
};

// Normalize for matching: lowercase, strip spaces/punctuation/accents.
// GeoJSON district names often differ slightly from the DB's district_name
// (spacing, casing, or minor spelling), which is why lookups fail for
// districts other than the one that happens to match exactly.
function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]/g, "");
}

export default function Dashboard({ user, token }) {
  // Cache of normalized-name -> real district_name from the API,
  // built once so every map click can resolve to a valid lookup.
  const lookupRef = useRef(null);
  const lookupPromiseRef = useRef(null);

  useEffect(() => {
    lookupPromiseRef.current = fetch("http://localhost:3000/api/districts")
      .then((r) => r.json())
      .then((json) => {
        const map = {};
        if (json.success) {
          for (const d of json.data) {
            map[normalize(d.district_name)] = d.district_name;
          }
        }
        lookupRef.current = map;
        return map;
      })
      .catch(() => {
        lookupRef.current = {};
        return {};
      });
  }, []);

  async function fetchDistrict(rawName) {
    try {
      const lookup = lookupRef.current || (await lookupPromiseRef.current);
      const key = normalize(rawName);

      // Exact normalized match first, then fall back to a "starts with /
      // contains" pass in case the GeoJSON name is abbreviated or has
      // extra qualifiers (e.g. "Rukum East" vs "Rukum").
      let realName = lookup[key];
      if (!realName) {
        const candidate = Object.keys(lookup).find(
          (k) => k.startsWith(key) || key.startsWith(k)
        );
        realName = candidate ? lookup[candidate] : rawName;
      }

      const res = await fetch(
        `http://localhost:3000/api/districts/${encodeURIComponent(realName)}`
      );
      const json = await res.json();

      if (!json.success) {
        return { error: `${json.message || "District not found"} (looked up as "${realName}")` };
      }

      return json.data;
    } catch (err) {
      console.error(err);
      return { error: "Failed to load district data" };
    }
  }

 return (
  <div
    style={{
      width: "100%",
      minHeight: "calc(100vh - 52px)",
      margin: 0,
      padding: 0,
      overflow: "hidden",
      background: "#f4f6f8",
    }}
  >
    <div
      style={{
        width: "100%",
        padding: "10px 16px",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "24px",
          lineHeight: 1.2,
          color: "#1a3c2e",
        }}
      >
        Nepal Development Dashboard
      </h1>
    </div>

    <NepalMap
      provinceData={provinceData}
      districtData={districtData}
      onDistrictClick={fetchDistrict}
    />
  </div>
);
}