// O Load Test verifica o comportamento do sistema sob uma carga previsível de usuários.

import http from 'k6/http'
import { sleep, check } from 'k6'
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"

export let options = {
    stages: [
      { duration: "2m", target: 500 },   // Aumenta gradualmente para 500 usuários em 2 minutos
      { duration: "3m", target: 1000 },  // Aumenta gradualmente para 1000 usuários
      { duration: "5m", target: 2000 },  // Mantém 2000 usuários por 5 minutos
      { duration: "2m", target: 2000 },  // Mantém os 2000 usuários para observar estabilidade
      { duration: "1m", target: 0 }      // Reduz para 0 ao final do teste
    ],
    thresholds: {
      http_req_duration: ["p(95)<500"], // 95% das respostas devem ser mais rápidas que 500ms
      "http_req_duration{staticAsset:yes}": ["p(99)<150"], // 99% dos ativos estáticos devem carregar em menos de 150ms
      "http_req_duration{staticAsset:no}": ["avg<200", "p(95)<400"], // Tempo médio de resposta deve ser inferior a 200ms, 95% das respostas em menos de 400ms
    },
}

export default function () {
    let res = http.get('https://your-address-api.com/endpoint')
    check(res, {
        'status é 200': (r) => r.status === 200,
        'tempo de resposta < 300ms': (r) => r.timings.duration < 300,
    })
    sleep(1)
}

export function handleSummary(data) {
    const htmlFile = `report/load_test.html`
    return {
        [htmlFile]: htmlReport(data),
        stdout: JSON.stringify(data),
    }
}
