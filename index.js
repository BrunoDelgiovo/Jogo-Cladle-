import { Metazoa } from "./metazoa.js";

function commonClade(speciesKeyA, speciesKeyB) {  
    const speciesA = Metazoa[speciesKeyA].cladeList;
    const speciesB = new Set(Metazoa[speciesKeyB].cladeList);

    for(const clade of speciesA)
        if (speciesB.has(clade))
            return clade;
}

// examples with extinct species
console.log("TyrannosaurusRex and Megalodon share a common clade: " + commonClade("TyrannosaurusRex", "Megalodon"));
console.log("Velociraptor and Spinosaurus share a common clade: " + commonClade("Velociraptor", "Spinosaurus"));
console.log("Allosaurus and Giganotosaurus share a common clade: " + commonClade("Allosaurus", "Giganotosaurus"));
console.log(" Opabinia and Anomalocaris share a common clade: " + commonClade("Opabinia", "Anomalocaris"));
console.log("Dimetrodon and Edaphosaurus share a common clade: " + commonClade("Dimetrodon", "Edaphosaurus"));
console.log("Ammonite and Archaeopteryx share a common clade: " + commonClade("Ammonite", "Archaeopteryx"));
