import * as tolt_wasm from "tolt_wasm";
const data_wasm = tolt_wasm.new_data();
const data = () => {
  return JSON.parse(data_wasm.to_json_str())
}
// console.log(data());
const get = (element_id) => {
  return document.getElementById(element_id)
}
const capitalize = (str) => {
  return str.replace(/^\w/, (c) => c.toUpperCase())
}
const go = (path) => {
  navigation.innerHTML = ""
  for (const i in path) {
    const href = `?${path[i].id}`
    const id = `link-${path[i].id}`
    const text = path[i].text
    navigation.innerHTML += `<a id="${id}" href="${href}">${text}</a>`
  }
  const href = `?${path[path.length-1].id}`
  // history.pushState(null, null, href)
}
const list_subcommands = (commands) => {
  subcommands.innerHTML = ""
  for (const i in commands) {
    const href = `?${commands[i].id}`
    const id = `link-${commands[i].id}`
    const text = commands[i].text
    subcommands.innerHTML += `<a id="${id}" href="${href}">${text}</a>`
  }
  const href = `?${commands[commands.length-1].id}`
  history.pushState(null, null, href)
}
const display = (tool) => {
  get(tool.id).style.display = 'block'
}
const sas_vs_sarl = {
  'id': 'sas-or-sarl',
  'text': 'SAS vs SARL',
}
const cmd_status = {
  'id': 'status',
  'text': 'Générateur de status',
}
const world = () => {
  go([{
    'id': 'world',
    'text': 'World',
  }])
  list_subcommands([{
    'id': 'europe',
    'text': 'Europe',
  }])
}
const europe = () => {
  go([{
    'id': 'world',
    'text': 'World',
  },{
    'id': 'europe',
    'text': 'Europe',
  }])
  list_subcommands([{
    'id': 'france',
    'text': 'France',
  }])
}
const france = () => {
  go([{
    'id': 'world',
    'text': 'World',
  },{
    'id': 'europe',
    'text': 'Europe',
  },{
    'id': 'france',
    'text': 'France',
  }])
  list_subcommands([
    sas_vs_sarl,
    cmd_status
  ])
}


const sas_or_sarl = () => {
  go([{
      'id': 'world',
      'text': 'World',
    },{
      'id': 'europe',
      'text': 'Europe',
    },{
      'id': 'france',
      'text': 'France',
    },
    sas_vs_sarl
  ])
  display(sas_vs_sarl)
  let remaining_points = 10
  const criterias = {
      html: get('sas-or-sarl-criterias'),
      data: [{
        text: "Je souhaite pouvoir céder mes titres sans agrément, c'est-à-dire sans l'accord d'un ou plusieurs de mes associés.",
        details: [
          "En SARL, il est obligatoire de demander l'accord des autres associés lorsque l'on souhaite céder ses titres (parts sociales) à un tiers, c'est-à-dire à une personne qui n'est pas dans l'entreprise",
          "En SAS, il est possible de céder ses actions à la personne de son choix ou de prévoir l'accord de ses associés. Il faudra décider cela dans les statuts de la société.",
        ],
        impact: {
          sas:  +1,
          sarl: -1,
        }
    }, {
        text: "Je souhaite que la cession des titres soit le plus facile possible et le moins taxé.",
        impact: {
          sas:  +1,
          sarl: -1,
        }
    }, {
        text: "Je souhaite avoir une direction collégiale.",
        impact: {
          sas:  +1,
          sarl: -1,
        }
    }, {
        text: "Le dirigeant de la société sera une personne morale.",
        warnings: [
          "Cela est uniquement possible pour une SAS."
        ],
        impact: {
          sas:  +1,
          sarl: -1,
        },
        warnings: [
          "Uniquement possible pour les SAS."
        ]
    }, {
        text: "Mes statuts doivent m'offrir la plus grande flexibilité pour organiser la gestion de ma société.",
        impact: {
          sas:  +1,
          sarl: -1,
        }
    }, {
        text: "Je souhaite ou souhaiterais peut-être créer des catégories d’actionnaires différents.",
        impact: {
          sas:  +1,
          sarl: -1,
        },
        examples: [
          'Par exemple des actions sans droit de vote pour les investisseurs'
        ]
    }, {
        text: "Je souhaite avoir la liberté de décider dans les statuts ou le pacte d’associés des conditions de vote lors des assemblées générales ou des majorités pour passer certaines décisions importantes.",
        impact: {
          sas:  +1,
          sarl: -1,
        },
    }, {
        text: "Les règles de gestion de mon entreprise sont déjà déterminées par la loi.",
        impact: {
          sas:  -1,
          sarl: +1,
        },
    }, {
        text: "Je souhaite créer une société familiale imposé à l’IR.",
        impact: {
          sas:  -1,
          sarl: +1,
        },
    }, {
        text: "Je ne veux pas payer de charges sociales sur les dividendes .",
        impact: {
          sas:  +1,
          sarl: -1,
        },
    }]
  }
  window.add_one = (criteria_index) => {
    remaining_points -= 1;
    criterias.data[criteria_index].score += 1;
    refresh()
  }
  window.remove_one = (criteria_index) => {
    if (criterias.data[criteria_index].score > 0) {
      remaining_points += 1;
      criterias.data[criteria_index].score -= 1;
      refresh()
    } else {
      // todo: warning
    }
  }
  window.toggle_details = (criteria_index) => {
    criterias.data[criteria_index].show_details *= -1;
    if (!criterias.data[criteria_index].show_details) {
      criterias.data[criteria_index].show_details = 1;
    }
    refresh()
  }
  const refresh = () => {
    // get('sas-or-sarl-points').innerHTML = remaining_points
    let total_points = 0;
    criterias.html.innerHTML = ""
    let scores = {
      sas:0,
      sarl:0,
    }
    for (const i in criterias.data) {
      const criteria = criterias.data[i]
      if (!criteria.score) {
        criteria.score = 0
      }
      total_points += criteria.score
      scores.sas += criteria.score * criteria.impact.sas
      scores.sarl += criteria.score * criteria.impact.sarl
      // TODO: use an input for the points
      const id = `criteria-${i}-points`
      let highlight_points = "no-highlight-points"
      if (criteria.score > 0) {
        highlight_points = "highlight-points"
      }
      let details_button = "<button style='background:transparent'></button>"
      if (criteria.details && criteria.details.length > 0) {
        details_button = `<button onclick=toggle_details('${i}') class=button-details>?</button>`
      }
      criterias.html.innerHTML += `
        <div class="criteria-wrapper">
          <button id=${id} class="${highlight_points}">${criteria.score}</button>
          <button onclick=add_one('${i}')     class=add-one>+</button>
          <button onclick=remove_one('${i}')  class=remove-one>-</button>
          ${details_button}
          <div class="criteria">${criteria.text}</div>
        </div>`
      if (criteria.show_details === 1) {
        for (const i_details in criteria.details) {
          const d = criteria.details[i_details]
          criterias.html.innerHTML += `
          <div class="criteria-wrapper explanation">
            <button ></button>
            <button ></button>
            <button ></button>
            <button ></button>
            <div class="criteria">${d}</div>
          </div>`
        }
      }

      if (criteria.score > 0) {
        for (const i_warning in criteria.warnings) {
          const text = criteria.warnings[i_warning]
          criterias.html.innerHTML += `
          <div class="criteria-wrapper explanation">
            <button ></button>
            <button ></button>
            <button ></button>
            <button ></button>
            <div class="criteria">⚠️ ${text}</div>
          </div>`
        }
      }
    }
    const response = get('sas-or-sarl-response')
    console.log(scores)
    if (total_points === 0) {
      response.innerHTML = "Merci de sélectionner des critères pour générer une réponse."
    } else if (scores.sas > scores.sarl) {
      response.innerHTML = "Une SAS semble plus adaptée à vos besoin."
    } else if (scores.sas < scores.sarl) {
      response.innerHTML = "Une SARL semble plus adaptée à vos besoin."
    } else if (scores.sas === scores.sarl) {
      response.innerHTML = "Difficile de choisir. Pouvez-vous ajouter des critères ?"
    }

  }
  refresh()
}

const status = () => {
  go([{
    'id': 'world',
    'text': 'World',
  },{
    'id': 'europe',
    'text': 'Europe',
  },{
    'id': 'france',
    'text': 'France',
  },{
    'id': 'status',
    'text': 'Générateur de status',
  }])
}
const default_ = () => {
  france()
}
const commands = {
  'world': world,
  'europe': europe,
  'france': france,
  'sas-or-sarl': sas_or_sarl,
  'status': status,
  'default': default_
}
for (const command in commands) {
  if (!document.getElementById(command)) {
    // console.error(`no element for ${command}`);
  }
}
Array.prototype.forEach.call( document.querySelectorAll('[id]'), function(html_element, i) {
  if (commands[html_element.id]) {
    if (html_element.localName === "button") {
      html_element.onclick = () => {
        // console.log(html_element)
      }
    }
  } else {
    //console.error(`no command for ${html_element.id}`);
  }
});
const id = window.location.search.substring(1)
const div = document.getElementById(id);
console.log("id", id)
if (id) {
  commands[id]()
} else {
  commands['default']()
}
