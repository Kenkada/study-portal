/* Course map: the single list of units, lessons and reference sheets.
   lesson.js uses it for breadcrumbs and prev/next links; index.html uses it for
   the syllabus map. Add new lessons here and nowhere else. */
window.COURSE = {
  title: "Mechanical Design (MEMEC502)",
  book: "Design of Machine Elements By V B Bhandari 3Ed (1).pdf",
  bookOffset: 24, // PDF page = book page + 24
  builtUpTo: "0047", // lessons after this id are planned, not yet written
  slides: "MEMEC 502 PPTPDF.pdf",
  qbank: "Mechanical Design Questions ppt 10 SEPT 25.pptx.pdf",
  tut: "Tut sheet 2 MEMEC 502.docxpdf.pdf",
  units: [
    {
      n: 1,
      title: "Design basics, materials and fatigue",
      syllabus: "Brief review of strength of materials · Design process: need, analysis, conceptual design, technical viability, economic and financial viability · Types of loading · Design criteria: strength, stiffness, resilience, production and maintenance · Factor of safety · Material selection: iso-strength and iso-rigidity · Fatigue: S–N curve, stress concentration, fatigue failure criteria, design of simple elements under cyclic loading",
      ref: "unit1-formulas.html"
    },
    {
      n: 2,
      title: "Joints, levers and power screws",
      syllabus: "Knuckle and cotter joints · Riveted, bolted and welded joints · Levers · Power screws · Screw jack",
      ref: "unit2-formulas.html"
    },
    {
      n: 3,
      title: "Power transmission elements",
      syllabus: "Shafts · Keys and splines · Couplings · Friction drives: belts, chains · Clutches and brakes",
      ref: "unit3-formulas.html"
    },
    {
      n: 4,
      title: "Springs and gears",
      syllabus: "Open-coiled and closed-coiled helical springs · Leaf springs · Gear terminology and geometry · Analysis and design of spur, helical and bevel gears",
      ref: "unit4-formulas.html"
    },
    {
      n: 5,
      title: "Bearings and material handling",
      syllabus: "Stribeck curve and lubrication regimes · Hydrodynamic journal bearing · Rolling element bearings: selection of deep groove ball and roller bearings under combined load · Material handling equipment: classification, wire ropes, hooks, sheaves, drums · Design data book · Software and advanced topics",
      ref: "unit5-formulas.html"
    }
  ],
  lessons: [
    // Unit 1
    { id: "0001", unit: 1, file: "0001-som-review-stresses.html", title: "Strength of materials review: direct, bending and torsional stress", pages: "79–84" },
    { id: "0002", unit: 1, file: "0002-principal-stresses-failure-theories.html", title: "Principal stresses and theories of failure", pages: "104–117" },
    { id: "0003", unit: 1, file: "0003-design-process.html", title: "The mechanical engineering design process", pages: "1–9" },
    { id: "0004", unit: 1, file: "0004-loads-criteria-factor-of-safety.html", title: "Types of loading, design criteria and factor of safety", pages: "76–79, 180" },
    { id: "0005", unit: 1, file: "0005-material-selection-iso-strength-rigidity.html", title: "Material selection: iso-strength and iso-rigidity", pages: "51–53" },
    { id: "0006", unit: 1, file: "0006-fatigue-sn-curve-endurance-limit.html", title: "Fatigue: fluctuating stress, S–N curve and endurance limit", pages: "149–159" },
    { id: "0007", unit: 1, file: "0007-stress-concentration-notch-sensitivity.html", title: "Stress concentration and notch sensitivity", pages: "141–149, 154" },
    { id: "0008", unit: 1, file: "0008-reversed-stress-finite-infinite-life.html", title: "Reversed stress: design for finite and infinite life", pages: "159–167" },
    { id: "0009", unit: 1, file: "0009-fluctuating-stress-goodman-soderberg-gerber.html", title: "Fluctuating stress: Soderberg, Goodman and Gerber", pages: "167–177" },
    { id: "0010", unit: 1, file: "0010-combined-fatigue-cyclic-design.html", title: "Fatigue under combined stresses: designing simple elements", pages: "177–180" },
    { id: "0011", unit: 1, file: "0011-unit1-mixed-practice.html", title: "Unit 1 mixed practice", pages: "" },
    // Unit 2
    { id: "0012", unit: 2, file: "0012-cotter-joint.html", title: "Design of the socket-and-spigot cotter joint", pages: "85–94" },
    { id: "0013", unit: 2, file: "0013-knuckle-joint.html", title: "Design of the knuckle joint", pages: "94–104" },
    { id: "0014", unit: 2, file: "0014-riveted-joints.html", title: "Riveted joints: failure modes and efficiency", pages: "298–321" },
    { id: "0015", unit: 2, file: "0015-eccentric-riveted-joints.html", title: "Eccentrically loaded riveted joints", pages: "321–325" },
    { id: "0016", unit: 2, file: "0016-welded-joints-axial.html", title: "Welded joints: butt and fillet welds under direct load", pages: "272–285" },
    { id: "0017", unit: 2, file: "0017-welded-joints-eccentric.html", title: "Welded joints under eccentric load, bending and torsion", pages: "285–297" },
    { id: "0018", unit: 2, file: "0018-bolted-joints-basics.html", title: "Threaded fasteners and simple bolted joints", pages: "219–233, 248" },
    { id: "0019", unit: 2, file: "0019-bolted-joints-eccentric.html", title: "Eccentrically loaded bolted joints", pages: "233–248" },
    { id: "0020", unit: 2, file: "0020-bolted-joints-preload-fatigue.html", title: "Bolt preload, joint stiffness and fluctuating load", pages: "254–269" },
    { id: "0021", unit: 2, file: "0021-levers.html", title: "Design of levers", pages: "117–128" },
    { id: "0022", unit: 2, file: "0022-power-screw-mechanics.html", title: "Power screws: torque, efficiency and self-locking", pages: "184–194" },
    { id: "0023", unit: 2, file: "0023-screw-jack-design.html", title: "Design of screw, nut and screw jack", pages: "194–214" },
    { id: "0024", unit: 2, file: "0024-unit2-mixed-practice.html", title: "Unit 2 mixed practice", pages: "" },
    // Unit 3
    { id: "0025", unit: 3, file: "0025-shafts-strength-rigidity.html", title: "Shafts: design on strength and torsional rigidity", pages: "330–334, 342–346" },
    { id: "0026", unit: 3, file: "0026-shafts-asme-combined-loads.html", title: "Shafts with pulleys and gears: ASME code", pages: "334–342" },
    { id: "0027", unit: 3, file: "0027-keys-splines.html", title: "Keys and splines", pages: "346–356" },
    { id: "0028", unit: 3, file: "0028-muff-clamp-couplings.html", title: "Couplings I: muff and clamp couplings", pages: "356–362" },
    { id: "0029", unit: 3, file: "0029-flange-flexible-couplings.html", title: "Couplings II: rigid flange and bushed-pin flexible", pages: "362–376" },
    { id: "0030", unit: 3, file: "0030-flat-belts.html", title: "Flat belt drives: geometry, tensions and power", pages: "499–522" },
    { id: "0031", unit: 3, file: "0031-v-belts-belt-selection.html", title: "V-belts and selecting belts from catalogues", pages: "514–542" },
    { id: "0032", unit: 3, file: "0032-chain-drives.html", title: "Roller chain drives", pages: "544–562" },
    { id: "0033", unit: 3, file: "0033-plate-clutches.html", title: "Friction clutches I: single- and multi-plate", pages: "448–461" },
    { id: "0034", unit: 3, file: "0034-cone-centrifugal-clutches.html", title: "Friction clutches II: cone and centrifugal; energy and heat", pages: "461–470" },
    { id: "0035", unit: 3, file: "0035-block-brakes.html", title: "Brakes I: energy equations and block brakes", pages: "472–485" },
    { id: "0036", unit: 3, file: "0036-band-internal-disk-brakes.html", title: "Brakes II: band, internal expanding and disk brakes", pages: "485–496" },
    { id: "0037", unit: 3, file: "0037-unit3-mixed-practice.html", title: "Unit 3 mixed practice", pages: "" },
    // Unit 4
    { id: "0038", unit: 4, file: "0038-helical-springs-stress-deflection.html", title: "Closed-coiled helical springs: stress and deflection", pages: "393–416" },
    { id: "0039", unit: 4, file: "0039-helical-spring-design-fatigue.html", title: "Designing helical springs: trial and error, fluctuating load, concentric springs", pages: "405–433" },
    { id: "0040", unit: 4, file: "0040-open-coiled-springs.html", title: "Open-coiled helical springs, and helical torsion springs", pages: "394, 433–435" },
    { id: "0041", unit: 4, file: "0041-leaf-springs.html", title: "Leaf (multi-leaf) springs", pages: "437–441" },
    { id: "0042", unit: 4, file: "0042-gear-terminology-geometry.html", title: "Gear terminology and geometry", pages: "646–658, 670–672" },
    { id: "0043", unit: 4, file: "0043-spur-gear-forces-beam-strength.html", title: "Spur gears: force analysis and beam strength", pages: "658–674" },
    { id: "0044", unit: 4, file: "0044-spur-gear-dynamic-wear-design.html", title: "Spur gears: dynamic load, wear strength and design", pages: "674–690" },
    { id: "0045", unit: 4, file: "0045-helical-gears.html", title: "Helical gears", pages: "694–709" },
    { id: "0046", unit: 4, file: "0046-bevel-gears.html", title: "Bevel gears", pages: "711–728" },
    { id: "0047", unit: 4, file: "0047-unit4-mixed-practice.html", title: "Unit 4 mixed practice", pages: "" },
    // Unit 5
    { id: "0048", unit: 5, file: "0048-stribeck-curve-lubrication.html", title: "Lubrication regimes and the Stribeck curve", pages: "601–608" },
    { id: "0049", unit: 5, file: "0049-hydrodynamic-journal-bearing.html", title: "Design of a hydrodynamic journal bearing", pages: "619–634" },
    { id: "0050", unit: 5, file: "0050-rolling-bearings-intro-life.html", title: "Rolling element bearings: types, capacity and life", pages: "564–573" },
    { id: "0051", unit: 5, file: "0051-bearing-selection-combined-load.html", title: "Selecting ball and roller bearings for combined load", pages: "573–588" },
    { id: "0052", unit: 5, file: "0052-material-handling-wire-ropes.html", title: "Material handling equipment and wire ropes", pages: "797–804" },
    { id: "0053", unit: 5, file: "0053-sheaves-drums-hooks.html", title: "Sheaves, drums and crane hooks", pages: "130–135, 804–806" },
    { id: "0054", unit: 5, file: "0054-data-book-software-advanced.html", title: "Using the design data book; design software; advanced topics", pages: "9–14" },
    { id: "0055", unit: 5, file: "0055-unit5-mixed-practice.html", title: "Unit 5 mixed practice", pages: "" }
  ],
  references: [
    { file: "unit1-formulas.html", title: "Unit 1 formula and procedure sheet" },
    { file: "unit2-formulas.html", title: "Unit 2 formula and procedure sheet" },
    { file: "unit3-formulas.html", title: "Unit 3 formula and procedure sheet" },
    { file: "unit4-formulas.html", title: "Unit 4 formula and procedure sheet" },
    { file: "unit5-formulas.html", title: "Unit 5 formula and procedure sheet", planned: true },
    { file: "exam-playbook.html", title: "Exam playbook: which method for which problem", planned: true },
    { file: "glossary.html", title: "Glossary and symbols", planned: true }
  ]
};
