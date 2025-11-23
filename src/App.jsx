import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Download, LogOut, X, Calendar } from 'lucide-react';

export default function AppVendas() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [comissaoPadrao, setComissaoPadrao] = useState(15);
  const [editingId, setEditingId] = useState(null);
  const [camposPersonalizados, setCamposPersonalizados] = useState([]);
  const [mostraFormCampo, setMostraFormCampo] = useState(false);
  const [novoCampo, setNovoCampo] = useState({ nome: '', tipo: 'texto' });

  // Filtros de data
  const [filtroDataInicio, setFiltroDataInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [filtroDataFim, setFiltroDataFim] = useState(new Date().toISOString().split('T')[0]);

  const [formCliente, setFormCliente] = useState({
    nome: '', cpf: '', telefone: '', email: '', dataContato: new Date().toISOString().split('T')[0]
  });

  const [formVenda, setFormVenda] = useState({
    numeroReserva: '', clienteId: '', hotel: '', checkIn: '', checkOut: '', hospedes: 1,
    valorVenda: '', comissao: comissaoPadrao, observacoes: '',
    camposExtras: {}
  });

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('appVendas');
    if (dadosSalvos) {
      const { clientes: c, vendas: v, comissao: cm, camposPersonalizados: cp } = JSON.parse(dadosSalvos);
      setClientes(c || []);
      setVendas(v || []);
      setComissaoPadrao(cm || 15);
      setCamposPersonalizados(cp || []);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      localStorage.setItem('appVendas', JSON.stringify({ 
        clientes, 
        vendas, 
        comissao: comissaoPadrao,
        camposPersonalizados
      }));
    }
  }, [clientes, vendas, comissaoPadrao, loggedIn, camposPersonalizados]);

  const handleLogin = () => {
    if (loginInput.trim()) {
      setUserName(loginInput);
      setLoggedIn(true);
      setLoginInput('');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserName('');
  };

  const handleAddCliente = () => {
    if (formCliente.nome && formCliente.telefone) {
      const novoCliente = {
        id: Date.now(),
        ...formCliente
      };
      setClientes([...clientes, novoCliente]);
      setFormCliente({ nome: '', cpf: '', telefone: '', email: '', dataContato: new Date().toISOString().split('T')[0] });
      alert('Cliente adicionado com sucesso!');
    }
  };

  const handleDeleteCliente = (id) => {
    if (confirm('Tem certeza que deseja deletar este cliente?')) {
      setClientes(clientes.filter(c => c.id !== id));
    }
  };

  const handleAddCampoPersonalizado = () => {
    if (novoCampo.nome.trim()) {
      const novo = {
        id: Date.now(),
        ...novoCampo
      };
      setCamposPersonalizados([...camposPersonalizados, novo]);
      setNovoCampo({ nome: '', tipo: 'texto' });
      setMostraFormCampo(false);
      alert('Campo personalizado adicionado!');
    }
  };

  const handleDeleteCampoPersonalizado = (id) => {
    if (confirm('Tem certeza que deseja deletar este campo?')) {
      setCamposPersonalizados(camposPersonalizados.filter(c => c.id !== id));
      setVendas(vendas.map(v => {
        const novaVenda = { ...v };
        delete novaVenda.camposExtras[id];
        return novaVenda;
      }));
    }
  };

  const handleAddVenda = () => {
    if (formVenda.numeroReserva && formVenda.clienteId && formVenda.hotel && formVenda.checkIn && formVenda.checkOut && formVenda.valorVenda) {
      const checkIn = new Date(formVenda.checkIn);
      const checkOut = new Date(formVenda.checkOut);
      const dias = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      if (dias <= 0) {
        alert('Data de saída deve ser depois da data de entrada!');
        return;
      }

      const valorTotal = parseFloat(formVenda.valorVenda);
      const valorComissao = (valorTotal * formVenda.comissao) / 100;

      const novaVenda = {
        id: editingId || Date.now(),
        ...formVenda,
        dias,
        valorTotal,
        valorComissao,
        dataVenda: new Date().toISOString().split('T')[0]
      };

      if (editingId) {
        setVendas(vendas.map(v => v.id === editingId ? novaVenda : v));
        setEditingId(null);
      } else {
        setVendas([...vendas, novaVenda]);
      }

      setFormVenda({ 
        numeroReserva: '', clienteId: '', hotel: '', checkIn: '', checkOut: '', hospedes: 1, 
        valorVenda: '', comissao: comissaoPadrao, observacoes: '',
        camposExtras: {}
      });
      alert('Venda registrada com sucesso!');
    }
  };

  const handleDeleteVenda = (id) => {
    if (confirm('Tem certeza que deseja deletar esta venda?')) {
      setVendas(vendas.filter(v => v.id !== id));
    }
  };

  const handleEditVenda = (venda) => {
    setFormVenda({
      numeroReserva: venda.numeroReserva,
      clienteId: venda.clienteId,
      hotel: venda.hotel,
      checkIn: venda.checkIn,
      checkOut: venda.checkOut,
      hospedes: venda.hospedes,
      valorVenda: venda.valorTotal,
      comissao: venda.comissao,
      observacoes: venda.observacoes,
      camposExtras: venda.camposExtras || {}
    });
    setEditingId(venda.id);
    setCurrentPage('vendas');
  };

  // Filtrar vendas por data
  const vendsFiltradas = vendas.filter(v => {
    const dataVenda = new Date(v.dataVenda);
    const dataInicio = new Date(filtroDataInicio);
    const dataFim = new Date(filtroDataFim);
    dataFim.setHours(23, 59, 59, 999);
    return dataVenda >= dataInicio && dataVenda <= dataFim;
  });

  const totalVendido = vendsFiltradas.reduce((sum, v) => sum + parseFloat(v.valorTotal || 0), 0);
  const totalComissao = vendsFiltradas.reduce((sum, v) => sum + parseFloat(v.valorComissao || 0), 0);

  const getNomeCliente = (id) => {
    const cliente = clientes.find(c => c.id == id);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  const renderizarCampoPersonalizado = (campo, valor, onChange) => {
    const id = campo.id;
    const v = valor || '';

    switch(campo.tipo) {
      case 'data':
        return (
          <input
            type="date"
            value={v}
            onChange={(e) => onChange(id, e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 w-full"
          />
        );
      case 'numero':
        return (
          <input
            type="number"
            step="0.01"
            placeholder={campo.nome}
            value={v}
            onChange={(e) => onChange(id, e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 w-full"
          />
        );
      case 'contrato':
        return (
          <input
            type="text"
            placeholder={`Nº ${campo.nome}`}
            value={v}
            onChange={(e) => onChange(id, e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 w-full"
          />
        );
      case 'documento':
        return (
          <input
            type="text"
            placeholder={`${campo.nome} (documento)`}
            value={v}
            onChange={(e) => onChange(id, e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 w-full"
          />
        );
      case 'texto':
      default:
        return (
          <input
            type="text"
            placeholder={campo.nome}
            value={v}
            onChange={(e) => onChange(id, e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 w-full"
          />
        );
    }
  };

  // Exportar para Excel otimizado
  const exportarExcel = () => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    const linhas = [];
    linhas.push(['RELATÓRIO DE VENDAS', dataAtual]);
    linhas.push(['Agente:', userName]);
    linhas.push(['Período:', `${filtroDataInicio} a ${filtroDataFim}`]);
    linhas.push(['']);
    
    linhas.push(['Nº RESERVA', 'CLIENTE', 'CHECK-IN', 'CHECK-OUT', 'DIAS', 'VALOR VENDA', 'COMISSÃO %', 'COMISSÃO R$']);
    
    vendsFiltradas.forEach(v => {
      linhas.push([
        v.numeroReserva,
        getNomeCliente(v.clienteId),
        v.checkIn,
        v.checkOut,
        v.dias,
        v.valorTotal.toFixed(2),
        v.comissao,
        v.valorComissao.toFixed(2)
      ]);
    });
    
    linhas.push(['']);
    linhas.push(['RESUMO DO PERÍODO']);
    linhas.push(['Total de Vendas', vendsFiltradas.length]);
    linhas.push(['Valor Total de Vendas (R$)', totalVendido.toFixed(2)]);
    linhas.push(['Valor Total de Comissão (R$)', totalComissao.toFixed(2)]);

    let csv = linhas.map(linha => linha.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">📱 Control Vendas</h1>
          <p className="text-gray-600 text-center mb-6">Gerencie suas vendas de hospedagem</p>
          <input
            type="text"
            placeholder="Digite seu nome"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">📱 Control Vendas</h1>
            <p className="text-blue-100">Bem-vindo, {userName}!</p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2">
            <LogOut size={20} /> Sair
          </button>
        </div>
      </div>

      <div className="bg-white shadow border-b">
        <div className="max-w-6xl mx-auto flex gap-4 px-4 py-3 overflow-x-auto">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${currentPage === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('clientes')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${currentPage === 'clientes' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            👥 Clientes
          </button>
          <button
            onClick={() => setCurrentPage('vendas')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${currentPage === 'vendas' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            💰 Vendas
          </button>
          <button
            onClick={() => setCurrentPage('campos')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${currentPage === 'campos' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            ⚙️ Campos
          </button>
          <button
            onClick={() => setCurrentPage('config')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${currentPage === 'config' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            🔧 Config
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {currentPage === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar size={20} /> Filtrar por Período
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Data Início</label>
                  <input
                    type="date"
                    value={filtroDataInicio}
                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Data Fim</label>
                  <input
                    type="date"
                    value={filtroDataFim}
                    onChange={(e) => setFiltroDataFim(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFiltroDataInicio(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
                      setFiltroDataFim(new Date().toISOString().split('T')[0]);
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold"
                  >
                    Mês Atual
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Total Vendido</p>
                <p className="text-3xl font-bold text-blue-600">R$ {totalVendido.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">{vendsFiltradas.length} vendas</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Total Comissão</p>
                <p className="text-3xl font-bold text-green-600">R$ {totalComissao.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">{(totalComissao / totalVendido * 100).toFixed(1)}% do total</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Ticket Médio</p>
                <p className="text-3xl font-bold text-purple-600">R$ {(vendsFiltradas.length > 0 ? totalVendido / vendsFiltradas.length : 0).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">por venda</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Vendas do Período</h3>
                {vendsFiltradas.length > 0 && (
                  <button
                    onClick={exportarExcel}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                  >
                    <Download size={20} /> Exportar Relatório
                  </button>
                )}
              </div>
              {vendsFiltradas.length === 0 ? (
                <p className="text-gray-500">Nenhuma venda neste período</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Nº Reserva</th>
                        <th className="px-4 py-2 text-left">Cliente</th>
                        <th className="px-4 py-2 text-left">Check-in</th>
                        <th className="px-4 py-2 text-left">Check-out</th>
                        <th className="px-4 py-2 text-left">Valor</th>
                        <th className="px-4 py-2 text-left">Comissão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendsFiltradas.map((v) => (
                        <tr key={v.id} className="border-b">
                          <td className="px-4 py-2 font-semibold">{v.numeroReserva}</td>
                          <td className="px-4 py-2">{getNomeCliente(v.clienteId)}</td>
                          <td className="px-4 py-2">{v.checkIn}</td>
                          <td className="px-4 py-2">{v.checkOut}</td>
                          <td className="px-4 py-2 font-semibold">R$ {v.valorTotal.toFixed(2)}</td>
                          <td className="px-4 py-2 text-green-600 font-semibold">R$ {v.valorComissao.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === 'clientes' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gerenciar Clientes</h2>
            
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-xl font-bold mb-4">Adicionar Novo Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={formCliente.nome}
                  onChange={(e) => setFormCliente({...formCliente, nome: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="CPF (xxx.xxx.xxx-xx)"
                  value={formCliente.cpf}
                  onChange={(e) => setFormCliente({...formCliente, cpf: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={formCliente.telefone}
                  onChange={(e) => setFormCliente({...formCliente, telefone: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formCliente.email}
                  onChange={(e) => setFormCliente({...formCliente, email: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleAddCliente}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Adicionar Cliente
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientes.map((cliente) => (
                <div key={cliente.id} className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-bold text-lg mb-2">{cliente.nome}</h4>
                  <p className="text-gray-600 text-sm">📱 {cliente.telefone}</p>
                  <p className="text-gray-600 text-sm">📧 {cliente.email || 'N/A'}</p>
                  <p className="text-gray-600 text-sm">🆔 {cliente.cpf || 'N/A'}</p>
                  <button
                    onClick={() => handleDeleteCliente(cliente.id)}
                    className="mt-3 w-full bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600"
                  >
                    <Trash2 size={18} /> Deletar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'campos' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Campos Personalizados</h2>
            <p className="text-gray-600 mb-6">Adicione campos personalizados para registrar informações adicionais em cada venda</p>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
              {!mostraFormCampo ? (
                <button
                  onClick={() => setMostraFormCampo(true)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Adicionar Novo Campo
                </button>
              ) : (
                <div>
                  <h3 className="text-lg font-bold mb-4">Criar Novo Campo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Nome do campo"
                      value={novoCampo.nome}
                      onChange={(e) => setNovoCampo({...novoCampo, nome: e.target.value})}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <select
                      value={novoCampo.tipo}
                      onChange={(e) => setNovoCampo({...novoCampo, tipo: e.target.value})}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="texto">📝 Texto</option>
                      <option value="numero">🔢 Número</option>
                      <option value="data">📅 Data</option>
                      <option value="contrato">📋 Contrato</option>
                      <option value="documento">📄 Documento</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCampoPersonalizado}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Salvar Campo
                    </button>
                    <button
                      onClick={() => {
                        setMostraFormCampo(false);
                        setNovoCampo({ nome: '', tipo: 'texto' });
                      }}
                      className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {camposPersonalizados.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">Nome</th>
                      <th className="px-4 py-3 text-left">Tipo</th>
                      <th className="px-4 py-3 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {camposPersonalizados.map((campo) => (
                      <tr key={campo.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold">{campo.nome}</td>
                        <td className="px-4 py-3">
                          {campo.tipo === 'texto' && '📝 Texto'}
                          {campo.tipo === 'numero' && '🔢 Número'}
                          {campo.tipo === 'data' && '📅 Data'}
                          {campo.tipo === 'contrato' && '📋 Contrato'}
                          {campo.tipo === 'documento' && '📄 Documento'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteCampoPersonalizado(campo.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          >
                            <X size={18} /> Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {currentPage === 'vendas' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Editar' : 'Registrar Nova'} Venda</h2>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-lg font-bold mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nº da Reserva"
                  value={formVenda.numeroReserva}
                  onChange={(e) => setFormVenda({...formVenda, numeroReserva: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <select
                  value={formVenda.clienteId}
                  onChange={(e) => setFormVenda({...formVenda, clienteId: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecionar Cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Hotel/Resort"
                  value={formVenda.hotel}
                  onChange={(e) => setFormVenda({...formVenda, hotel: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="date"
                  value={formVenda.checkIn}
                  onChange={(e) => setFormVenda({...formVenda, checkIn: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="date"
                  value={formVenda.checkOut}
                  onChange={(e) => setFormVenda({...formVenda, checkOut: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Número de hóspedes"
                  min="1"
                  value={formVenda.hospedes}
                  onChange={(e) => setFormVenda({...formVenda, hospedes: parseInt(e.target.value)})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Valor Total da Venda (R$)"
                  step="0.01"
                  value={formVenda.valorVenda}
                  onChange={(e) => setFormVenda({...formVenda, valorVenda: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Comissão (%)"
                  step="0.1"
                  value={formVenda.comissao}
                  onChange={(e) => setFormVenda({...formVenda, comissao: parseFloat(e.target.value)})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <textarea
                placeholder="Observações"
                value={formVenda.observacoes}
                onChange={(e) => setFormVenda({...formVenda, observacoes: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                rows="3"
              />

              {camposPersonalizados.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4 mt-6 pt-6 border-t">Informações Adicionais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {camposPersonalizados.map((campo) => (
                      <div key={campo.id}>
                        <label className="block text-sm font-semibold mb-2">{campo.nome}</label>
                        {renderizarCampoPersonalizado(
                          campo,
                          formVenda.camposExtras[campo.id],
                          (id, valor) => setFormVenda({
                            ...formVenda,
                            camposExtras: { ...formVenda.camposExtras, [id]: valor }
                          })
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleAddVenda}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                {editingId ? 'Atualizar Venda' : '+ Registrar Venda'}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormVenda({ numeroReserva: '', clienteId: '', hotel: '', checkIn: '', checkOut: '', hospedes: 1, valorVenda: '', comissao: comissaoPadrao, observacoes: '', camposExtras: {} });
                  }}
                  className="w-full mt-2 bg-gray-400 text-white py-2 rounded-lg"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Nº Reserva</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Check-in</th>
                    <th className="px-4 py-3 text-left">Check-out</th>
                    <th className="px-4 py-3 text-left">Valor Venda</th>
                    <th className="px-4 py-3 text-left">Comissão</th>
                    <th className="px-4 py-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{v.numeroReserva}</td>
                      <td className="px-4 py-3">{getNomeCliente(v.clienteId)}</td>
                      <td className="px-4 py-3 text-xs">{v.checkIn}</td>
                      <td className="px-4 py-3 text-xs">{v.checkOut}</td>
                      <td className="px-4 py-3 font-semibold">R$ {v.valorTotal.toFixed(2)}</td>
                      <td className="px-4 py-3 text-green-600 font-bold">R$ {v.valorComissao.toFixed(2)}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleEditVenda(v)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteVenda(v.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vendas.length === 0 && (
                <p className="p-4 text-center text-gray-500">Nenhuma venda registrada</p>
              )}
            </div>
          </div>
        )}

        {currentPage === 'config' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Configurações</h2>
            <div className="bg-white p-6 rounded-lg shadow max-w-md">
              <h3 className="text-xl font-bold mb-4">Comissão Padrão</h3>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Percentual de Comissão (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={comissaoPadrao}
                  onChange={(e) => setComissaoPadrao(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-gray-600 text-sm">Esta porcentagem será usada automaticamente em novas vendas</p>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-bold mb-4">Dados da Aplicação</h3>
                <p className="text-gray-600 mb-4">Total de clientes: <strong>{clientes.length}</strong></p>
                <p className="text-gray-600 mb-4">Total de vendas: <strong>{vendas.length}</strong></p>
                <p className="text-gray-600 mb-4">Campos personalizados: <strong>{camposPersonalizados.length}</strong></p>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita!')) {
                      setClientes([]);
                      setVendas([]);
                      setCamposPersonalizados([]);
                      alert('Dados limpos com sucesso!');
                    }
                  }}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  🗑️ Limpar Todos os Dados
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
