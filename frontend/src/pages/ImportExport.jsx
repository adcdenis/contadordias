import React, { useState } from 'react';
import { counterAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const ImportExport = () => {
  const { showToast } = useToast();
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedItemsCount, setParsedItemsCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [rawData, setRawData] = useState(null);

  const handleExport = async () => {
    try {
      setExportLoading(true);
      setError('');
      const data = await counterAPI.export();
      const content = JSON.stringify(data.items || [], null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `counters-export-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exportação concluída com sucesso');
    } catch (err) {
      console.error(err);
      setError('Erro ao exportar contadores');
    } finally {
      setExportLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    setSummary(null);
    setError('');
    setParsedItemsCount(0);
    setRawData(null);
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const items = Array.isArray(json) ? json : Array.isArray(json.items) ? json.items : null;
      if (!items) {
        setError('Arquivo inválido: esperado array ou objeto com "items"');
        return;
      }
      setParsedItemsCount(items.length);
      setRawData(items);
    } catch (err) {
      console.error(err);
      setError('Erro ao ler/parsear arquivo JSON');
    }
  };

  const handleImport = async () => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      setError('Nenhum item válido para importar');
      return;
    }
    try {
      setImportLoading(true);
      setError('');
      const result = await counterAPI.import(rawData);
      setSummary(result);
      if (result.success) {
        showToast(`Importação concluída: ${result.created} criado(s), ${result.updated} atualizado(s)`);
      } else {
        showToast('Importação concluída com erros');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao importar contadores');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Importar / Exportar Contadores</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Exportar</h2>
        <p className="text-gray-600 mb-4">Baixe um arquivo JSON com seus contadores atuais. O arquivo gerado contém um <strong>array</strong> de objetos (sem wrapper).</p>
        <button
          className="btn btn-primary inline-flex items-center gap-2"
          onClick={handleExport}
          disabled={exportLoading}
        >
          {exportLoading ? (
            'Exportando...'
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v8.19l2.72-2.72a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 111.06-1.06l2.72 2.72V4.5A.75.75 0 0112 3.75z" clipRule="evenodd" />
                <path d="M4.5 19.5a.75.75 0 01.75-.75h13.5a.75.75 0 01.75.75v0a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75z" />
              </svg>
              Exportar JSON
            </>
          )}
        </button>
      </div>     

      <div className="bg-white shadow-md rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Importar</h2>
        <p className="text-gray-600 mb-4">Selecione um arquivo JSON. Se o <code>nome do contador</code> já existir, o registro será atualizado; caso contrário, um novo será criado. Aceita <strong>array</strong> ou objeto com chave <code>items</code>. Apenas seus registros serão afetados.</p>
        <div className="mb-4">
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="form-input"
          />
          {fileName && (
            <p className="text-sm text-gray-500 mt-2">Arquivo: {fileName}</p>
          )}
          {parsedItemsCount > 0 && (
            <p className="text-sm text-gray-500">Itens detectados: {parsedItemsCount}</p>
          )}
        </div>
        <button
          className="btn btn-success inline-flex items-center gap-2"
          onClick={handleImport}
          disabled={importLoading || !rawData}
        >
          {importLoading ? 'Importando...' : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12 20.25a.75.75 0 01-.75-.75v-8.19l-2.72 2.72a.75.75 0 11-1.06-1.06l4-4a.75.75 0 011.06 0l4 4a.75.75 0 11-1.06 1.06l-2.72-2.72v8.19a.75.75 0 01-.75.75z" clipRule="evenodd" />
                <path d="M4.5 4.5a.75.75 0 01.75-.75h13.5a.75.75 0 01.75.75v0a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75z" />
              </svg>
              Importar
            </>
          )}
        </button>

        {summary && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Resumo da Importação</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>Total processado: {summary.total}</li>
              <li>Criados: {summary.created}</li>
              <li>Atualizados: {summary.updated}</li>
              <li>Erros: {summary.errorsCount}</li>
              <li>Status: {summary.success ? 'Concluída com sucesso' : 'Concluída com erros'}</li>
            </ul>
            {Array.isArray(summary.errors) && summary.errors.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold">Detalhes dos erros</h4>
                <div className="overflow-auto max-h-48 mt-2 border rounded p-3 bg-gray-50">
                  <pre className="text-xs">{JSON.stringify(summary.errors, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
         {/* Explicação dos campos e formato JSON */}
      <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-4 rounded mb-8">
        <h3 className="text-lg font-semibold mb-2">Formato do JSON (Importação/Exportação)</h3>
        <p className="text-sm mb-3">
          • Exportação: retorna um <strong>array</strong> de contadores.<br/>
          • Importação: aceita um <strong>array</strong> de contadores ou um objeto no formato <code>{'{'}"items": [ ... ]{'}'}</code>.
        </p>
        <h4 className="font-semibold mb-1">Campos do contador</h4>
        <ul className="list-disc list-inside text-sm mb-3">
          <li><code>name</code> (obrigatório): texto não vazio e único por usuário.</li>
          <li><code>description</code> (opcional): texto livre.</li>
          <li><code>eventDate</code> (opcional): data em ISO 8601 (ex.: <code>YYYY-MM-DDTHH:mm:ss.sssZ</code>). Se ausente ou inválida, será definido o horário atual.</li>
          <li><code>category</code> (opcional): texto livre. Padrão: <code>Geral</code>.</li>
          <li><code>recurrence</code> (opcional): valores aceitos: <code>none</code>, <code>weekly</code>, <code>monthly</code>, <code>yearly</code>. Padrão: <code>none</code>.</li>
        </ul>
        <p className="text-xs text-blue-800 mb-3">Campos desconhecidos são ignorados durante a importação.</p>
        <h4 className="font-semibold mb-2">Exemplo de objeto de contador</h4>
        <div className="overflow-auto max-h-64 border rounded p-3 bg-white">
          <pre className="text-xs">{"{\n  \"name\": \"Vale Mercado\",\n  \"description\": \"\",\n  \"eventDate\": \"2025-10-15T03:00:00.000Z\",\n  \"category\": \"Finanças\",\n  \"recurrence\": \"monthly\"\n}"}</pre>
        </div>
        <p className="text-xs text-blue-800 mt-2">Para importar vários, use um <strong>array</strong> desses objetos ou <code>{'{'}"items": [ ... ]{'}'}</code>.</p>
      </div>
    </div>
  );
};

export default ImportExport;