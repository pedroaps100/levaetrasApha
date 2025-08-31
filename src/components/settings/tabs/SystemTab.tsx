import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { Category, Bairro, Region } from '@/types';
import { CategoryFormDialog } from './CategoryFormDialog';
import { BairroFormDialog } from './BairroFormDialog';
import { RegionFormDialog } from './RegionFormDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSettingsData } from '@/hooks/useSettingsData';

// Category List Component
const CategoryList: React.FC<{
    categories: Category[];
    type: 'receitas' | 'despesas';
    onEdit: (category: Category, type: 'receitas' | 'despesas') => void;
    onDelete: (category: Category, type: 'receitas' | 'despesas') => void;
}> = ({ categories, type, onEdit, onDelete }) => (
    <div className="space-y-2">
        {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span className="font-medium">{cat.name}</span>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(cat, type)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Deseja remover a categoria "{cat.name}"?</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(cat, type)}>Remover</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        ))}
    </div>
);

export const SystemTab = () => {
    const {
        categories, addCategory, updateCategory, deleteCategory,
        regions, addRegion, updateRegion, deleteRegion,
        bairros, addBairro, updateBairro, deleteBairro
    } = useSettingsData();
    
    // States for UI control
    const [activeCategoryTab, setActiveCategoryTab] = useState<'receitas' | 'despesas'>('receitas');
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<{data: Category, type: 'receitas' | 'despesas'} | null>(null);
    const [isRegionFormOpen, setIsRegionFormOpen] = useState(false);
    const [regionToEdit, setRegionToEdit] = useState<Region | null>(null);
    const [isBairroFormOpen, setIsBairroFormOpen] = useState(false);
    const [bairroToEdit, setBairroToEdit] = useState<Bairro | null>(null);

    // Handlers for Categories
    const handleOpenCategoryForm = (category: Category | null, type: 'receitas' | 'despesas') => {
        setCategoryToEdit(category ? { data: category, type } : null);
        setIsCategoryFormOpen(true);
    };
    
    const handleCategorySubmit = (data: { name: string }) => {
        const type = categoryToEdit?.type ?? activeCategoryTab;
        if (categoryToEdit) {
            updateCategory(type, categoryToEdit.data.id, data);
            toast.success(`Categoria "${data.name}" atualizada!`);
        } else {
            addCategory(type, data);
            toast.success(`Categoria "${data.name}" adicionada!`);
        }
        setIsCategoryFormOpen(false);
    };

    const handleDeleteCategory = (category: Category, type: 'receitas' | 'despesas') => {
        deleteCategory(type, category.id);
        toast.success(`Categoria "${category.name}" removida!`);
    };

    // Handlers for Regions
    const handleOpenRegionForm = (region: Region | null) => {
        setRegionToEdit(region);
        setIsRegionFormOpen(true);
    };

    const handleRegionSubmit = (data: { name: string }) => {
        if (regionToEdit) {
            updateRegion(regionToEdit.id, data);
            toast.success(`Região "${data.name}" atualizada!`);
        } else {
            addRegion(data);
            toast.success(`Região "${data.name}" adicionada!`);
        }
        setIsRegionFormOpen(false);
    };

    const handleDeleteRegion = (region: Region) => {
        deleteRegion(region.id);
        toast.success(`Região "${region.name}" e seus bairros foram removidos!`);
    };

    // Handlers for Bairros
    const handleOpenBairroForm = (bairro: Bairro | null) => {
        setBairroToEdit(bairro);
        setIsBairroFormOpen(true);
    };

    const handleBairroSubmit = (data: Omit<Bairro, 'id'>) => {
        if (bairroToEdit) {
            updateBairro(bairroToEdit.id, data);
            toast.success(`Bairro "${data.nome}" atualizado!`);
        } else {
            addBairro(data);
            toast.success(`Bairro "${data.nome}" adicionado!`);
        }
        setIsBairroFormOpen(false);
    };

    const handleDeleteBairro = (bairro: Bairro) => {
        deleteBairro(bairro.id);
        toast.success(`Bairro "${bairro.nome}" removido!`);
    };

    const renderBairroActions = (bairro: Bairro) => (
        <div className="flex justify-end items-center">
            <Button variant="ghost" size="icon" onClick={() => handleOpenBairroForm(bairro)}><Pencil className="h-4 w-4" /></Button>
            <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Deseja remover o bairro "{bairro.nome}"?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteBairro(bairro)}>Remover</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Gerencie as categorias de receitas e despesas.</CardDescription>
            </div>
            <Button onClick={() => handleOpenCategoryForm(null, activeCategoryTab)} className="w-full md:w-auto mt-4 md:mt-0">
                <PlusCircle className="mr-2 h-4 w-4"/>Adicionar Categoria
            </Button>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="receitas" onValueChange={(value) => setActiveCategoryTab(value as 'receitas' | 'despesas')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="receitas">Receitas</TabsTrigger>
                    <TabsTrigger value="despesas">Despesas</TabsTrigger>
                </TabsList>
                <TabsContent value="receitas">
                    <CategoryList categories={categories.receitas} type="receitas" onEdit={handleOpenCategoryForm} onDelete={handleDeleteCategory} />
                </TabsContent>
                <TabsContent value="despesas">
                    <CategoryList categories={categories.despesas} type="despesas" onEdit={handleOpenCategoryForm} onDelete={handleDeleteCategory} />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <CardTitle>Taxas, Bairros e Regiões</CardTitle>
                <CardDescription>Organize seus bairros em regiões e defina as taxas.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                <Button onClick={() => handleOpenRegionForm(null)} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Nova Região</Button>
                <Button onClick={() => handleOpenBairroForm(null)} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Novo Bairro</Button>
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full border rounded-lg px-4">
                {regions.map(region => (
                    <AccordionItem value={region.id} key={region.id}>
                        <div className="flex w-full items-center">
                            <AccordionTrigger className="flex-1 text-left hover:no-underline">
                                <span className="font-semibold text-base">{region.name}</span>
                            </AccordionTrigger>
                            <div className="flex items-center gap-1 pl-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenRegionForm(region)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Remover Região?</AlertDialogTitle>
                                            <AlertDialogDescription>Isso removerá a região "{region.name}" e todos os bairros associados. Esta ação não pode ser desfeita.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteRegion(region)}>Remover</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                        <AccordionContent>
                            {/* Desktop View */}
                            <div className="hidden lg:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Bairro</TableHead>
                                            <TableHead>Taxa de Entrega</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bairros.filter(b => b.regionId === region.id).map(bairro => (
                                            <TableRow key={bairro.id}>
                                                <TableCell className="font-medium">{bairro.nome}</TableCell>
                                                <TableCell>{bairro.taxa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                                <TableCell className="text-right">{renderBairroActions(bairro)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                             {/* Mobile/Tablet View */}
                            <div className="grid gap-2 lg:hidden">
                                {bairros.filter(b => b.regionId === region.id).map(bairro => (
                                    <div key={bairro.id} className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="font-medium">{bairro.nome}</p>
                                            <p className="text-sm text-muted-foreground">{bairro.taxa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                        </div>
                                        {renderBairroActions(bairro)}
                                    </div>
                                ))}
                            </div>
                            {bairros.filter(b => b.regionId === region.id).length === 0 && (
                                <div className="text-center text-muted-foreground py-4">Nenhum bairro nesta região.</div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>

      <CategoryFormDialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen} categoryToEdit={categoryToEdit?.data ?? null} categoryType={categoryToEdit?.type ?? activeCategoryTab} onFormSubmit={handleCategorySubmit} />
      <RegionFormDialog open={isRegionFormOpen} onOpenChange={setIsRegionFormOpen} regionToEdit={regionToEdit} onFormSubmit={handleRegionSubmit} />
      <BairroFormDialog open={isBairroFormOpen} onOpenChange={setIsBairroFormOpen} bairroToEdit={bairroToEdit} regions={regions} onFormSubmit={handleBairroSubmit} />
    </div>
  );
};
