import type * as ts from 'typescript/lib/tsserverlibrary';
interface TypeScriptModule {
    typescript: typeof ts;
}
interface LanguageServicePlugin {
    create(info: ts.server.PluginCreateInfo): ts.LanguageService;
}
declare function init(modules: TypeScriptModule): LanguageServicePlugin;
export = init;
//# sourceMappingURL=typescript-plugin.d.ts.map