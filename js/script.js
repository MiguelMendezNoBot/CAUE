// Mantener la clase CAUECalculator original (sin cambios en la lógica)
class CAUECalculator {
    static factorRecuperacionCapital(i, n) {
        if (i === 0) return 1 / n;
        return (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    }

    static factorValorPresente(i, n) {
        if (i === 0) return n;
        return (Math.pow(1 + i, n) - 1) / (i * Math.pow(1 + i, n));
    }

    static calcularCAUE(alternativa, tasaInteres) {
        const { inversion, vidaUtil, valorSalvamento = 0, costosOperacion = 0, ingresos = 0 } = alternativa;

        const factorRC = this.factorRecuperacionCapital(tasaInteres, vidaUtil);
        const caueInversion = inversion * factorRC;
        const caueValorSalvamento = valorSalvamento * factorRC;
        const caueTotal = caueInversion + costosOperacion - ingresos - caueValorSalvamento;

        return {
            caueInversion: caueInversion,
            caueValorSalvamento: caueValorSalvamento,
            costosOperacion: costosOperacion,
            ingresos: ingresos,
            caueTotal: caueTotal,
            factorRC: factorRC
        };
    }

    static compararAlternativas(alternativas, tasaInteres) {
        const resultados = alternativas.map((alt, index) => {
            const caue = this.calcularCAUE(alt, tasaInteres);
            return {
                nombre: alt.nombre || `Alternativa ${index + 1}`,
                ...alt,
                ...caue
            };
        });

        const ordenados = [...resultados].sort((a, b) => a.caueTotal - b.caueTotal);

        return {
            resultados: resultados,
            mejorAlternativa: ordenados[0],
            ranking: ordenados,
            resumen: {
                tasaInteres: tasaInteres * 100 + '%',
                numeroAlternativas: alternativas.length,
                diferenciaCostos: ordenados[1] ?
                    Math.abs(ordenados[1].caueTotal - ordenados[0].caueTotal) : 0
            }
        };
    }
}

// Variables globales para la interfaz web
let alternativas = [];

// Funciones de la interfaz web
function agregarAlternativa() {
    const nombre = document.getElementById('nombre').value || `Alternativa ${alternativas.length + 1}`;
    const inversion = parseFloat(document.getElementById('inversion').value) || 0;
    const vidaUtil = parseInt(document.getElementById('vidaUtil').value) || 0;
    const valorSalvamento = parseFloat(document.getElementById('valorSalvamento').value) || 0;
    const costosOperacion = parseFloat(document.getElementById('costosOperacion').value) || 0;
    const ingresos = parseFloat(document.getElementById('ingresos').value) || 0;

    if (inversion <= 0 || vidaUtil <= 0) {
        alert('❌ Por favor, ingresa valores válidos para la inversión inicial y vida útil.');
        return;
    }

    const alternativa = {
        nombre,
        inversion,
        vidaUtil,
        valorSalvamento,
        costosOperacion,
        ingresos
    };

    alternativas.push(alternativa);
    actualizarListaAlternativas();
    limpiarFormulario();
}

function cargarEjemploDocente() {
    document.getElementById('nombre').value = 'Ejercicio Docente';
    document.getElementById('inversion').value = '30000';
    document.getElementById('vidaUtil').value = '8';
    document.getElementById('valorSalvamento').value = '0';
    document.getElementById('costosOperacion').value = '8500';
    document.getElementById('ingresos').value = '0';
    document.getElementById('tasaInteres').value = '5';
}

function limpiarFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('inversion').value = '';
    document.getElementById('vidaUtil').value = '';
    document.getElementById('valorSalvamento').value = '';
    document.getElementById('costosOperacion').value = '';
    document.getElementById('ingresos').value = '';
}

function eliminarAlternativa(index) {
    alternativas.splice(index, 1);
    actualizarListaAlternativas();
    if (alternativas.length === 0) {
        mostrarResultadosVacios();
    }
}

function actualizarListaAlternativas() {
    const container = document.getElementById('alternativas-container');

    if (alternativas.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; font-style: italic; font-size: clamp(0.85rem, 2.2vw, 1rem);">No hay alternativas agregadas.</p>';
        return;
    }

    container.innerHTML = alternativas.map((alt, index) => `
        <div class="alternative-item">
            <div class="alternative-header">
                <strong>${alt.nombre}</strong>
                <button class="remove-btn" onclick="eliminarAlternativa(${index})" title="Eliminar alternativa">✕</button>
            </div>
            <div style="font-size: clamp(0.8rem, 2.2vw, 0.9rem); color: #7f8c8d; line-height: 1.4;">
                💰 Inversión: ${alt.inversion.toLocaleString()}<br>
                📅 Vida útil: ${alt.vidaUtil} años<br>
                💸 Costos anuales: ${alt.costosOperacion.toLocaleString()}
            </div>
        </div>
    `).join('');
}

function calcularCAUE() {
    if (alternativas.length === 0) {
        alert('❌ Debes agregar al menos una alternativa para calcular.');
        return;
    }

    const tasaInteres = parseFloat(document.getElementById('tasaInteres').value) / 100;

    if (isNaN(tasaInteres) || tasaInteres < 0) {
        alert('❌ Por favor, ingresa una tasa de interés válida.');
        return;
    }

    const comparacion = CAUECalculator.compararAlternativas(alternativas, tasaInteres);
    mostrarResultados(comparacion);
}

function mostrarResultados(comparacion) {
    const container = document.getElementById('resultados-container');

    let html = `
        <div class="result-card">
            <div class="result-label">🏆 MEJOR ALTERNATIVA</div>
            <div class="result-value" style="color: #27ae60;">
                ${comparacion.mejorAlternativa.nombre}
            </div>
            <div style="font-size: clamp(1rem, 3vw, 1.2rem); margin-top: 10px;">
                CAUE: <strong>${comparacion.mejorAlternativa.caueTotal.toFixed(4)}</strong>
            </div>
        </div>

        <div class="result-card">
            <div class="result-label">📊 RESUMEN</div>
            <div style="margin-top: 10px; font-size: clamp(0.85rem, 2.5vw, 1rem);">
                <div>📈 Tasa de interés: <strong>${comparacion.resumen.tasaInteres}</strong></div>
                <div>🔢 Alternativas evaluadas: <strong>${comparacion.resumen.numeroAlternativas}</strong></div>
                ${comparacion.resumen.diferenciaCostos > 0 ?
        `<div>💰 Diferencia de costos: <strong>${comparacion.resumen.diferenciaCostos.toFixed(2)}</strong></div>`
        : ''}
            </div>
        </div>

        <h3 style="color: #2c3e50; margin: 20px 0 15px 0; font-size: clamp(1rem, 3vw, 1.2rem);">📋 Ranking de Alternativas</h3>
        <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th style="min-width: 40px;">Pos.</th>
                        <th style="min-width: 120px;">Alternativa</th>
                        <th style="min-width: 100px;">CAUE Total</th>
                        <th style="min-width: 90px;">Factor RC</th>
                    </tr>
                </thead>
                <tbody>
                    ${comparacion.ranking.map((alt, index) => `
                        <tr ${index === 0 ? 'class="best-alternative"' : ''}>
                            <td>${index + 1}</td>
                            <td style="word-break: break-word;">${alt.nombre}</td>
                            <td>${alt.caueTotal.toFixed(2)}</td>
                            <td>${alt.factorRC.toFixed(4)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <h3 style="color: #2c3e50; margin: 20px 0 15px 0; font-size: clamp(1rem, 3vw, 1.2rem);">🔍 Desglose Detallado</h3>
        ${comparacion.resultados.map(alt => `
            <div class="result-card">
                <h4 style="color: #2c3e50; margin-bottom: 15px; font-size: clamp(1rem, 3vw, 1.1rem);">${alt.nombre}</h4>
                <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: clamp(0.8rem, 2.2vw, 0.9rem);">
                    <div>💰 Inversión inicial: <strong>${alt.inversion.toLocaleString()}</strong></div>
                    <div>📅 Vida útil: <strong>${alt.vidaUtil} años</strong></div>
                    <div>💸 Costos anuales: <strong>${alt.costosOperacion.toLocaleString()}</strong></div>
                    <div>💵 Ingresos anuales: <strong>${alt.ingresos.toLocaleString()}</strong></div>
                    <div>🔄 Valor salvamento: <strong>${alt.valorSalvamento.toLocaleString()}</strong></div>
                    <div>📊 Factor RC: <strong>${alt.factorRC.toFixed(6)}</strong></div>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9ecef; font-size: clamp(0.9rem, 2.5vw, 1rem);">
                    <strong>CAUE TOTAL: ${alt.caueTotal.toFixed(2)}</strong>
                </div>
            </div>
        `).join('')}
    `;

    container.innerHTML = html;
}

function mostrarResultadosVacios() {
    const container = document.getElementById('resultados-container');
    container.innerHTML = `
        <div class="results-empty">
            ⚠️ Agrega al menos una alternativa y presiona "Calcular CAUE" para ver los resultados.
        </div>
    `;
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    actualizarListaAlternativas();
});